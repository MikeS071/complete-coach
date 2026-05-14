import { auth } from "@/auth";
import { dataResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import {
  checkInListQuerySchema,
  serializeCheckIn,
  toPrismaCheckInStatus
} from "@/lib/forms/submission-records";

export async function GET(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "submissions:read");
    const query = checkInListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const checkIns = await prisma.checkIn.findMany({
      where: {
        organizationId: actor.organizationId,
        ...(query.clientId ? { clientId: query.clientId } : {}),
        ...(query.status ? { status: toPrismaCheckInStatus(query.status) } : {})
      },
      include: {
        client: true,
        formSubmission: true
      },
      orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
      take: query.limit
    });

    return dataResponse(checkIns.map(serializeCheckIn));
  } catch (error) {
    return handleApiError(error);
  }
}
