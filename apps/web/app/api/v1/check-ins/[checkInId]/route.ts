import { auth } from "@/auth";
import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import { serializeCheckInDetail } from "@/lib/forms/submission-records";

interface CheckInRouteContext {
  params: Promise<{ checkInId: string }>;
}

export async function GET(_request: Request, context: CheckInRouteContext) {
  try {
    const actor = requireActiveActor(await auth(), "submissions:read");
    const { checkInId } = await context.params;
    const checkIn = await prisma.checkIn.findFirst({
      where: {
        id: checkInId,
        organizationId: actor.organizationId
      },
      include: {
        client: true,
        formSubmission: {
          include: {
            client: true,
            form: true,
            formVersion: true
          }
        }
      }
    });

    if (!checkIn) {
      return errorResponse("not_found", "Check-in not found.", 404);
    }

    const metrics = checkIn.formSubmissionId
      ? await prisma.clientMeasurement.findMany({
          where: {
            organizationId: actor.organizationId,
            sourceType: "form_submission",
            sourceId: checkIn.formSubmissionId
          },
          orderBy: [{ metricKey: "asc" }]
        })
      : [];

    return dataResponse(serializeCheckInDetail(checkIn, metrics));
  } catch (error) {
    return handleApiError(error);
  }
}
