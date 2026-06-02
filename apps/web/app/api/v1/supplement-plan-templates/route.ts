import { auth } from "@/auth";
import { dataResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import {
  buildSupplementTemplateWhere,
  createSupplementTemplateSchema,
  getSupplementTemplateCreateData,
  serializeSupplementTemplate,
  supplementTemplateListQuerySchema
} from "@/lib/supplementation/supplement-records";

export async function GET(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "supplements:read");
    const query = supplementTemplateListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const templates = await prisma.supplementPlanTemplate.findMany({
      where: buildSupplementTemplateWhere(actor.organizationId, query),
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      take: query.limit
    });

    return dataResponse(templates.map(serializeSupplementTemplate));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "supplements:write");
    const input = createSupplementTemplateSchema.parse(await request.json());
    const template = await prisma.supplementPlanTemplate.create({
      data: getSupplementTemplateCreateData(actor.organizationId, actor.userId, input)
    });

    await prisma.auditLog.create({
      data: {
        organizationId: actor.organizationId,
        actorUserId: actor.userId,
        action: "supplement_plan_template.created",
        targetType: "supplement_plan_template",
        targetId: template.id,
        metadata: {
          status: input.status
        }
      }
    });

    return dataResponse(serializeSupplementTemplate(template), {
      status: 201,
      headers: { Location: `/api/v1/supplement-plan-templates/${template.id}` }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
