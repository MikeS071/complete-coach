import { auth } from "@/auth";
import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import { serializeSubmission } from "@/lib/forms/submission-records";

export async function GET(_request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  try {
    const actor = requireActiveActor(await auth(), "submissions:read");
    const { submissionId } = await params;
    const submission = await prisma.formSubmission.findFirst({
      where: {
        id: submissionId,
        organizationId: actor.organizationId
      },
      include: {
        client: true,
        form: true,
        formVersion: true
      }
    });

    if (!submission) {
      return errorResponse("not_found", "Form submission was not found.", 404);
    }

    return dataResponse(serializeSubmission(submission));
  } catch (error) {
    return handleApiError(error);
  }
}
