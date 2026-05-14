import { z } from "zod";

import { LeadActivityType } from "@/app/generated/prisma/enums";
import { auth } from "@/auth";
import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";

const activityTypeValues = ["note", "email", "call"] as const;
const activityTypeMap = {
  note: LeadActivityType.NOTE,
  email: LeadActivityType.EMAIL,
  call: LeadActivityType.CALL
} as const;

const createActivitySchema = z.object({
  type: z.enum(activityTypeValues),
  body: z.string().trim().min(1).max(5000)
});

interface LeadActivitiesRouteContext {
  params: Promise<{ leadId: string }>;
}

export async function GET(_request: Request, context: LeadActivitiesRouteContext) {
  try {
    const actor = requireActiveActor(await auth(), "clients:read");
    const { leadId } = await context.params;
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId: actor.organizationId,
        deletedAt: null
      }
    });

    if (!lead) {
      return errorResponse("not_found", "Lead not found.", 404);
    }

    const activities = await prisma.leadActivity.findMany({
      where: {
        organizationId: actor.organizationId,
        leadId
      },
      orderBy: { occurredAt: "desc" }
    });

    return dataResponse(activities);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: LeadActivitiesRouteContext) {
  try {
    const actor = requireActiveActor(await auth(), "clients:write");
    const { leadId } = await context.params;
    const input = createActivitySchema.parse(await request.json());
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId: actor.organizationId,
        deletedAt: null
      }
    });

    if (!lead) {
      return errorResponse("not_found", "Lead not found.", 404);
    }

    const activity = await prisma.leadActivity.create({
      data: {
        organizationId: actor.organizationId,
        leadId,
        actorUserId: actor.userId,
        type: activityTypeMap[input.type],
        body: input.body
      }
    });

    await prisma.auditLog.create({
      data: {
        organizationId: actor.organizationId,
        actorUserId: actor.userId,
        action: "lead.activity_created",
        targetType: "lead",
        targetId: lead.id,
        metadata: { type: input.type }
      }
    });

    return dataResponse(activity, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
