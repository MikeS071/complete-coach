import { auth } from "@/auth";
import { dataResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import {
  buildExerciseWhere,
  createExerciseSchema,
  exerciseListQuerySchema,
  getExerciseCreateData,
  serializeExercise
} from "@/lib/training/training-records";

export async function GET(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "training:read");
    const query = exerciseListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const exercises = await prisma.exerciseLibraryItem.findMany({
      where: buildExerciseWhere(actor.organizationId, query),
      orderBy: [{ scope: "asc" }, { name: "asc" }],
      take: query.limit
    });

    return dataResponse(exercises.map(serializeExercise));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "training:write");
    const input = createExerciseSchema.parse(await request.json());
    const exercise = await prisma.exerciseLibraryItem.create({
      data: getExerciseCreateData(actor.organizationId, actor.userId, input)
    });

    await prisma.auditLog.create({
      data: {
        organizationId: actor.organizationId,
        actorUserId: actor.userId,
        action: "exercise.created",
        targetType: "exercise",
        targetId: exercise.id,
        metadata: {
          category: input.category,
          difficulty: input.difficulty
        }
      }
    });

    return dataResponse(serializeExercise(exercise), {
      status: 201,
      headers: { Location: `/api/v1/exercises/${exercise.id}` }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
