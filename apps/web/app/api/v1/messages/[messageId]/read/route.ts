import { auth } from "@/auth";
import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";

interface MessageReadRouteContext {
  params: Promise<{ messageId: string }>;
}

export async function POST(_request: Request, context: MessageReadRouteContext) {
  try {
    const actor = requireActiveActor(await auth(), "messages:write");
    const { messageId } = await context.params;
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        organizationId: actor.organizationId,
        deletedAt: null
      }
    });

    if (!message) {
      return errorResponse("not_found", "Message not found.", 404);
    }

    const receipt = await prisma.messageReceipt.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId: actor.userId
        }
      },
      update: { readAt: new Date() },
      create: {
        organizationId: actor.organizationId,
        messageId,
        userId: actor.userId
      }
    });

    return dataResponse({
      id: receipt.id,
      messageId: receipt.messageId,
      userId: receipt.userId,
      clientId: receipt.clientId,
      readAt: receipt.readAt.toISOString()
    });
  } catch (error) {
    return handleApiError(error);
  }
}
