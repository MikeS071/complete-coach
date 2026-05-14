import { auth } from "@/auth";
import { dataResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import {
  buildTrainingTemplateWhere,
  createTrainingTemplateSchema,
  getTrainingTemplateCreateData,
  serializeTrainingTemplate,
  trainingTemplateListQuerySchema
} from "@/lib/training/training-records";

export async function GET(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "training:read");
    const query = trainingTemplateListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const templates = await prisma.trainingProgramTemplate.findMany({
      where: buildTrainingTemplateWhere(actor.organizationId, query),
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      take: query.limit
    });

    return dataResponse(templates.map(serializeTrainingTemplate));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "training:write");
    const input = createTrainingTemplateSchema.parse(await request.json());
    const template = await prisma.trainingProgramTemplate.create({
      data: getTrainingTemplateCreateData(actor.organizationId, actor.userId, input)
    });

    await prisma.auditLog.create({
      data: {
        organizationId: actor.organizationId,
        actorUserId: actor.userId,
        action: "training_template.created",
        targetType: "training_program_template",
        targetId: template.id,
        metadata: {
          status: input.status,
          durationWeeks: input.durationWeeks
        }
      }
    });

    return dataResponse(serializeTrainingTemplate(template), {
      status: 201,
      headers: { Location: `/api/v1/training-program-templates/${template.id}` }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
