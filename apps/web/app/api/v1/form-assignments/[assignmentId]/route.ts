import { auth } from "@/auth";
import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import { serializeAssignment } from "@/lib/forms/submission-records";

interface AssignmentRouteContext {
  params: Promise<{ assignmentId: string }>;
}

export async function GET(_request: Request, context: AssignmentRouteContext) {
  try {
    const actor = requireActiveActor(await auth(), "submissions:read");
    const { assignmentId } = await context.params;
    const assignment = await prisma.formAssignment.findFirst({
      where: {
        id: assignmentId,
        organizationId: actor.organizationId
      },
      include: {
        client: true,
        form: true,
        formVersion: true
      }
    });

    if (!assignment) {
      return errorResponse("not_found", "Form assignment not found.", 404);
    }

    return dataResponse(serializeAssignment(assignment));
  } catch (error) {
    return handleApiError(error);
  }
}
