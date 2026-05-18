import { auth } from "@/auth";
import { dataResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import {
  buildMealPlanTemplateWhere,
  createMealPlanTemplateSchema,
  getMealPlanTemplateCreateData,
  mealPlanTemplateListQuerySchema,
  serializeMealPlanTemplate
} from "@/lib/nutrition/nutrition-records";

export async function GET(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "nutrition:read");
    const query = mealPlanTemplateListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const templates = await prisma.mealPlanTemplate.findMany({
      where: buildMealPlanTemplateWhere(actor.organizationId, query),
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      take: query.limit
    });

    return dataResponse(templates.map(serializeMealPlanTemplate));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "nutrition:write");
    const input = createMealPlanTemplateSchema.parse(await request.json());
    const template = await prisma.mealPlanTemplate.create({
      data: getMealPlanTemplateCreateData(actor.organizationId, actor.userId, input)
    });

    await prisma.auditLog.create({
      data: {
        organizationId: actor.organizationId,
        actorUserId: actor.userId,
        action: "meal_plan_template.created",
        targetType: "meal_plan_template",
        targetId: template.id,
        metadata: {
          status: input.status,
          targetCalories: input.targetCalories
        }
      }
    });

    return dataResponse(serializeMealPlanTemplate(template), {
      status: 201,
      headers: { Location: `/api/v1/meal-plan-templates/${template.id}` }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
