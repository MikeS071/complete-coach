import type { InputJsonValue } from "@prisma/client/runtime/client";

import { PaymentEventProcessingStatus } from "@/app/generated/prisma/enums";
import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { prisma } from "@/lib/db/prisma";
import {
  getConnectStatusFromStripeObject,
  getIgnoredStatus,
  getProcessedStatus,
  getStripeEventObject,
  getStripeMetadataValue,
  getStripeString,
  mapStripeSubscriptionStatus,
  parseStripeEvent,
  sanitizeStripeEventPayload,
  StripeEventPayload,
  StripeWebhookPayloadError,
  StripeWebhookSignatureError,
  verifyStripeWebhookSignature
} from "@/lib/payments/stripe-webhooks";

export async function POST(request: Request) {
  const rawBody = await request.text();

  try {
    verifyStripeWebhookSignature({
      rawBody,
      signatureHeader: request.headers.get("stripe-signature"),
      secret: process.env.STRIPE_WEBHOOK_SECRET
    });
  } catch (error) {
    if (error instanceof StripeWebhookSignatureError) {
      return errorResponse("invalid_signature", "Invalid Stripe webhook signature.", 400);
    }

    return handleApiError(error);
  }

  try {
    const event = parseStripeEvent(rawBody);
    const existingEvent = await prisma.paymentEvent.findUnique({
      where: { stripeEventId: event.id }
    });

    if (existingEvent) {
      return dataResponse({ received: true, duplicate: true });
    }

    const organizationId = await resolveOrganizationId(event);

    if (!organizationId) {
      return errorResponse("unmatched_payment_event", "Stripe webhook cannot be matched to an organization.", 202);
    }

    const paymentEvent = await prisma.paymentEvent.create({
      data: {
        organizationId,
        stripeEventId: event.id,
        type: event.type,
        payloadJson: sanitizeStripeEventPayload(event) as unknown as InputJsonValue,
        processingStatus: PaymentEventProcessingStatus.RECEIVED
      }
    });

    try {
      const processingStatus = await processStripeEvent(event, organizationId);

      await prisma.paymentEvent.update({
        where: { id: paymentEvent.id },
        data: {
          processingStatus,
          processedAt: new Date()
        }
      });

      return dataResponse({ received: true, duplicate: false, status: processingStatus });
    } catch (error) {
      await prisma.paymentEvent.update({
        where: { id: paymentEvent.id },
        data: {
          processingStatus: PaymentEventProcessingStatus.FAILED,
          processedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : "Stripe webhook processing failed."
        }
      });

      return errorResponse("payment_event_processing_failed", "Stripe webhook processing failed.", 500);
    }
  } catch (error) {
    if (error instanceof StripeWebhookPayloadError) {
      return errorResponse("invalid_payload", "Invalid Stripe webhook payload.", 400);
    }

    return handleApiError(error);
  }
}

async function resolveOrganizationId(event: StripeEventPayload) {
  const object = getStripeEventObject(event);
  const metadataOrganizationId = getStripeMetadataValue(object, "organization_id");

  if (metadataOrganizationId) {
    return metadataOrganizationId;
  }

  const accountId = getStripeString(object, "id") ?? event.account ?? null;

  if (event.type === "account.updated" && accountId) {
    const organization = await prisma.organization.findFirst({
      where: { stripeConnectAccountId: accountId },
      select: { id: true }
    });

    return organization?.id ?? null;
  }

  const subscriptionId = getStripeString(object, "id") ?? getStripeString(object, "subscription");
  const customerId = getStripeString(object, "customer");

  if (subscriptionId || customerId) {
    const subscription = await prisma.clientSubscription.findFirst({
      where: {
        OR: [
          ...(subscriptionId ? [{ stripeSubscriptionId: subscriptionId }] : []),
          ...(customerId ? [{ stripeCustomerId: customerId }] : [])
        ]
      },
      select: { organizationId: true }
    });

    return subscription?.organizationId ?? null;
  }

  return null;
}

async function processStripeEvent(event: StripeEventPayload, organizationId: string) {
  switch (event.type) {
    case "checkout.session.completed":
      await processCheckoutSessionCompleted(event, organizationId);
      return getProcessedStatus();
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await processSubscriptionChanged(event, organizationId);
      return getProcessedStatus();
    case "account.updated":
      await processAccountUpdated(event, organizationId);
      return getProcessedStatus();
    default:
      return getIgnoredStatus();
  }
}

async function processCheckoutSessionCompleted(event: StripeEventPayload, organizationId: string) {
  const object = getStripeEventObject(event);
  const subscriptionId = getStripeMetadataValue(object, "subscription_id");

  if (!subscriptionId) {
    throw new Error("Checkout session webhook is missing subscription metadata.");
  }

  await prisma.clientSubscription.update({
    where: {
      id: subscriptionId,
      organizationId
    },
    data: {
      stripeCheckoutSessionId: getStripeString(object, "id"),
      stripeCustomerId: getStripeString(object, "customer"),
      stripeSubscriptionId: getStripeString(object, "subscription")
    }
  });
}

async function processSubscriptionChanged(event: StripeEventPayload, organizationId: string) {
  const object = getStripeEventObject(event);
  const localSubscriptionId = getStripeMetadataValue(object, "subscription_id");
  const stripeSubscriptionId = getStripeString(object, "id");
  const stripeCustomerId = getStripeString(object, "customer");
  const subscription = localSubscriptionId
    ? await prisma.clientSubscription.findFirst({
        where: {
          id: localSubscriptionId,
          organizationId
        },
        select: { id: true }
      })
    : await prisma.clientSubscription.findFirst({
        where: {
          organizationId,
          OR: [
            ...(stripeSubscriptionId ? [{ stripeSubscriptionId }] : []),
            ...(stripeCustomerId ? [{ stripeCustomerId }] : [])
          ]
        },
        select: { id: true }
      });

  if (!subscription) {
    throw new Error("Subscription webhook cannot be matched to a local subscription.");
  }

  await prisma.clientSubscription.update({
    where: { id: subscription.id },
    data: {
      stripeSubscriptionId,
      stripeCustomerId,
      status:
        event.type === "customer.subscription.deleted"
          ? mapStripeSubscriptionStatus(getStripeString(object, "status") ?? "canceled")
          : mapStripeSubscriptionStatus(getStripeString(object, "status")),
      currentPeriodStart: getStripeTimestamp(object, "current_period_start"),
      currentPeriodEnd: getStripeTimestamp(object, "current_period_end"),
      cancelAt: getStripeTimestamp(object, "cancel_at")
    }
  });
}

async function processAccountUpdated(event: StripeEventPayload, organizationId: string) {
  const object = getStripeEventObject(event);
  const accountId = getStripeString(object, "id") ?? event.account ?? null;

  if (!accountId) {
    throw new Error("Account webhook is missing account id.");
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      stripeConnectAccountId: accountId,
      stripeConnectStatus: getConnectStatusFromStripeObject(object)
    }
  });
}

function getStripeTimestamp(object: Record<string, unknown>, key: string) {
  const value = object[key];

  return typeof value === "number" && Number.isFinite(value) ? new Date(value * 1000) : null;
}
