import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { prisma } from "@/lib/db/prisma";
import {
  getResendProviderEmailId,
  getResendRecipient,
  getResendTag,
  mapResendEventToStatus,
  resendWebhookSchema,
  serializeEmailDelivery,
  verifyResendWebhookSignature
} from "@/lib/operations/notification-records";

export async function POST(request: Request) {
  try {
    const rawPayload = await request.text();
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (webhookSecret && !verifyResendWebhookSignature(rawPayload, request.headers, webhookSecret)) {
      return errorResponse("invalid_signature", "Invalid webhook signature.", 400);
    }

    const payload = resendWebhookSchema.parse(JSON.parse(rawPayload));
    const deliveryId = getResendTag(payload, "email_delivery_id");
    const organizationId = getResendTag(payload, "organization_id");
    const providerEmailId = getResendProviderEmailId(payload);
    const status = mapResendEventToStatus(payload.type);
    const errorMessage = payload.data.error?.message ?? null;
    const metadata = {
      resendEventType: payload.type,
      resendCreatedAt: payload.created_at,
      providerEmailId
    };

    const existingDelivery = deliveryId
      ? await prisma.emailDelivery.findFirst({ where: { id: deliveryId } })
      : providerEmailId
        ? await prisma.emailDelivery.findFirst({ where: { providerEmailId } })
        : null;

    if (existingDelivery) {
      const updatedDelivery = await prisma.emailDelivery.update({
        where: { id: existingDelivery.id },
        data: {
          providerEmailId,
          status,
          eventType: payload.type,
          errorMessage,
          metadata
        }
      });

      return dataResponse(serializeEmailDelivery(updatedDelivery));
    }

    if (!organizationId || !providerEmailId) {
      return errorResponse("unmatched_email_delivery", "Webhook cannot be matched to an email delivery.", 202);
    }

    const createdDelivery = await prisma.emailDelivery.create({
      data: {
        organizationId,
        providerEmailId,
        toEmail: getResendRecipient(payload) ?? "unknown@example.invalid",
        subject: payload.data.subject ?? "Unknown Resend email",
        status,
        eventType: payload.type,
        errorMessage,
        metadata
      }
    });

    return dataResponse(serializeEmailDelivery(createdDelivery), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
