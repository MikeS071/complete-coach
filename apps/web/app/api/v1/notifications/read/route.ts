import { auth } from "@/auth";
import { dataResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  try {
    const actor = requireActiveActor(await auth(), "notifications:read");
    const result = await prisma.notification.updateMany({
      where: {
        organizationId: actor.organizationId,
        recipientUserId: actor.userId,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    return dataResponse({ updatedCount: result.count });
  } catch (error) {
    return handleApiError(error);
  }
}
