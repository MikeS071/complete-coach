import { auth } from "@/auth";
import { dataResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import {
  buildNotificationWhere,
  notificationListQuerySchema,
  serializeNotification
} from "@/lib/operations/notification-records";

export async function GET(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "notifications:read");
    const query = notificationListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const notifications = await prisma.notification.findMany({
      where: buildNotificationWhere(actor.organizationId, actor.userId, query),
      orderBy: { createdAt: "desc" },
      take: query.limit
    });

    return dataResponse(notifications.map(serializeNotification));
  } catch (error) {
    return handleApiError(error);
  }
}
