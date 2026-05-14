import { auth } from "@/auth";
import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import { serializeMetric } from "@/lib/forms/submission-records";

interface CheckInMetricsRouteContext {
  params: Promise<{ checkInId: string }>;
}

export async function GET(_request: Request, context: CheckInMetricsRouteContext) {
  try {
    const actor = requireActiveActor(await auth(), "metrics:read");
    const { checkInId } = await context.params;
    const checkIn = await prisma.checkIn.findFirst({
      where: {
        id: checkInId,
        organizationId: actor.organizationId
      }
    });

    if (!checkIn) {
      return errorResponse("not_found", "Check-in not found.", 404);
    }

    if (!checkIn.formSubmissionId) {
      return dataResponse([]);
    }

    const metrics = await prisma.clientMeasurement.findMany({
      where: {
        organizationId: actor.organizationId,
        sourceType: "form_submission",
        sourceId: checkIn.formSubmissionId
      },
      orderBy: [{ metricKey: "asc" }]
    });

    return dataResponse(metrics.map(serializeMetric));
  } catch (error) {
    return handleApiError(error);
  }
}
