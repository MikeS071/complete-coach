import { auth } from "@/auth";
import { dataResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import {
  buildLeadWhere,
  createLeadSchema,
  getLeadCreateData,
  leadListQuerySchema,
  serializeLead
} from "@/lib/crm/lead-records";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "clients:read");
    const query = leadListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const leads = await prisma.lead.findMany({
      where: buildLeadWhere(actor.organizationId, query),
      orderBy: [{ createdAt: "asc" }],
      take: query.limit
    });

    return dataResponse(leads.map(serializeLead));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "clients:write");
    const input = createLeadSchema.parse(await request.json());
    const lead = await prisma.lead.create({
      data: getLeadCreateData(actor.organizationId, input)
    });

    await prisma.auditLog.create({
      data: {
        organizationId: actor.organizationId,
        actorUserId: actor.userId,
        action: "lead.created",
        targetType: "lead",
        targetId: lead.id,
        metadata: { status: input.status, stage: input.stage }
      }
    });

    return dataResponse(serializeLead(lead), {
      status: 201,
      headers: { Location: `/api/v1/leads/${lead.id}` }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
