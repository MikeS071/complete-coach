import { auth } from "@/auth";
import { dataResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import {
  assignmentListQuerySchema,
  serializeAssignment,
  toPrismaAssignmentStatus
} from "@/lib/forms/submission-records";

export async function GET(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "submissions:read");
    const query = assignmentListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const assignments = await prisma.formAssignment.findMany({
      where: {
        organizationId: actor.organizationId,
        ...(query.clientId ? { clientId: query.clientId } : {}),
        ...(query.status ? { status: toPrismaAssignmentStatus(query.status) } : {})
      },
      include: {
        client: true,
        form: true,
        formVersion: true
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: query.limit
    });

    return dataResponse(assignments.map(serializeAssignment));
  } catch (error) {
    return handleApiError(error);
  }
}
