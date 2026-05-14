import { randomUUID } from "node:crypto";
import { z } from "zod";

const allowedMedia = {
  video: {
    maxBytes: 500 * 1024 * 1024,
    contentTypes: {
      "video/mp4": "mp4",
      "video/quicktime": "mov",
      "video/webm": "webm"
    }
  },
  image: {
    maxBytes: 10 * 1024 * 1024,
    contentTypes: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    }
  }
} as const;

export const exerciseMediaUploadSchema = z
  .object({
    mediaType: z.enum(["video", "image"]),
    filename: z.string().trim().min(1).max(180),
    contentType: z.string().trim().min(1).max(120),
    byteSize: z.number().int().min(1),
    checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i).optional()
  })
  .superRefine((input, context) => {
    const metadata = allowedMedia[input.mediaType];
    const extension = getExtension(input.filename);
    const expectedExtension = metadata.contentTypes[input.contentType as keyof typeof metadata.contentTypes];

    if (!(input.contentType in metadata.contentTypes)) {
      context.addIssue({
        code: "custom",
        path: ["contentType"],
        message: `Unsupported ${input.mediaType} content type.`
      });
    }

    if (input.byteSize > metadata.maxBytes) {
      context.addIssue({
        code: "custom",
        path: ["byteSize"],
        message: `${input.mediaType} upload exceeds the maximum allowed size.`
      });
    }

    if (!extension || extension !== expectedExtension) {
      context.addIssue({
        code: "custom",
        path: ["filename"],
        message: `File extension does not match the ${input.mediaType} content type.`
      });
    }
  });

export type ExerciseMediaUploadInput = z.infer<typeof exerciseMediaUploadSchema>;
export type ExerciseMediaType = ExerciseMediaUploadInput["mediaType"];

export function buildExerciseMediaObjectKey(organizationId: string, input: ExerciseMediaUploadInput) {
  const extension = allowedMedia[input.mediaType].contentTypes[
    input.contentType as keyof (typeof allowedMedia)[ExerciseMediaType]["contentTypes"]
  ];

  return `organizations/${organizationId}/training/exercises/${input.mediaType}/${randomUUID()}.${extension}`;
}

export function getExerciseMediaMaxBytes(mediaType: ExerciseMediaType) {
  return allowedMedia[mediaType].maxBytes;
}

export function validateExerciseMediaObjectKeys(
  organizationId: string,
  input: {
    videoObjectKey?: string | null;
    imageObjectKey?: string | null;
  }
) {
  if (input.videoObjectKey !== undefined && input.videoObjectKey !== null) {
    validateExerciseMediaObjectKey(organizationId, input.videoObjectKey, "video");
  }

  if (input.imageObjectKey !== undefined && input.imageObjectKey !== null) {
    validateExerciseMediaObjectKey(organizationId, input.imageObjectKey, "image");
  }
}

export function validateExerciseMediaObjectKey(
  organizationId: string,
  objectKey: string,
  mediaType: ExerciseMediaType
) {
  const escapedOrganizationId = escapeRegExp(organizationId);
  const allowedExtensions = Object.values(allowedMedia[mediaType].contentTypes).join("|");
  const pattern = new RegExp(
    `^organizations/${escapedOrganizationId}/training/exercises/${mediaType}/[0-9a-fA-F-]{36}\\.(${allowedExtensions})$`
  );

  if (!pattern.test(objectKey)) {
    throw new Error(`Invalid ${mediaType} object key for active organization.`);
  }
}

function getExtension(filename: string) {
  const extension = filename.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];

  if (extension === "jpeg") {
    return "jpg";
  }

  return extension;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
