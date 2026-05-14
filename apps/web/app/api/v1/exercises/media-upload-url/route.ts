import { auth } from "@/auth";
import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import {
  buildExerciseMediaObjectKey,
  exerciseMediaUploadSchema,
  getExerciseMediaMaxBytes
} from "@/lib/training/exercise-media";
import { createR2PresignedPutUrl, getR2Config } from "@/lib/storage/r2";

const uploadUrlTtlSeconds = 300;

export async function POST(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "training:write");
    const input = exerciseMediaUploadSchema.parse(await request.json());
    const r2Config = getR2Config();

    if (!r2Config) {
      return errorResponse("storage_unconfigured", "Object storage is not configured.", 503);
    }

    const objectKey = buildExerciseMediaObjectKey(actor.organizationId, input);
    const uploadUrl = createR2PresignedPutUrl(r2Config, {
      objectKey,
      contentType: input.contentType,
      expiresInSeconds: uploadUrlTtlSeconds
    });
    const expiresAt = new Date(Date.now() + uploadUrlTtlSeconds * 1000).toISOString();

    await prisma.auditLog.create({
      data: {
        organizationId: actor.organizationId,
        actorUserId: actor.userId,
        action: "exercise_media.upload_url_created",
        targetType: "exercise_media",
        targetId: objectKey,
        metadata: {
          mediaType: input.mediaType,
          contentType: input.contentType,
          byteSize: input.byteSize,
          checksumSha256: input.checksumSha256 ?? null
        }
      }
    });

    return dataResponse({
      objectKey,
      uploadUrl,
      expiresAt,
      method: "PUT",
      requiredHeaders: {
        "Content-Type": input.contentType
      },
      maxBytes: getExerciseMediaMaxBytes(input.mediaType),
      mediaType: input.mediaType
    });
  } catch (error) {
    if (error instanceof Error && error.message === "R2 storage is partially configured.") {
      return errorResponse("storage_misconfigured", "Object storage is misconfigured.", 503);
    }

    return handleApiError(error);
  }
}
