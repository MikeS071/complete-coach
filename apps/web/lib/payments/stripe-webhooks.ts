import { createHmac, timingSafeEqual } from "node:crypto";

import {
  ClientSubscriptionStatus,
  PaymentEventProcessingStatus
} from "@/app/generated/prisma/enums";
import { deriveConnectStatus } from "@/lib/payments/stripe-connect";

const signatureToleranceSeconds = 300;

export class StripeWebhookSignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StripeWebhookSignatureError";
  }
}

export class StripeWebhookPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StripeWebhookPayloadError";
  }
}

export interface StripeEventPayload {
  id: string;
  type: string;
  account?: string | null;
  data?: {
    object?: Record<string, unknown>;
  };
}

export function verifyStripeWebhookSignature(input: {
  rawBody: string;
  signatureHeader: string | null;
  secret: string | undefined;
  now?: number;
}) {
  if (!input.secret) {
    throw new StripeWebhookSignatureError("Stripe webhook secret is not configured.");
  }

  if (!input.signatureHeader) {
    throw new StripeWebhookSignatureError("Missing Stripe-Signature header.");
  }

  const timestamp = getSignatureTimestamp(input.signatureHeader);
  const signatures = getSignatureValues(input.signatureHeader);

  if (!timestamp || signatures.length === 0) {
    throw new StripeWebhookSignatureError("Malformed Stripe-Signature header.");
  }

  const now = input.now ?? Math.floor(Date.now() / 1000);

  if (Math.abs(now - timestamp) > signatureToleranceSeconds) {
    throw new StripeWebhookSignatureError("Stripe webhook signature timestamp is outside tolerance.");
  }

  const expected = createHmac("sha256", input.secret)
    .update(`${timestamp}.${input.rawBody}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const matched = signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, "hex");

    return signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);
  });

  if (!matched) {
    throw new StripeWebhookSignatureError("Stripe webhook signature verification failed.");
  }
}

export function parseStripeEvent(rawBody: string): StripeEventPayload {
  const payload = parseJsonPayload(rawBody) as StripeEventPayload;

  if (!payload.id || !payload.type) {
    throw new StripeWebhookPayloadError("Stripe webhook payload is not an event.");
  }

  return payload;
}

export function getStripeEventObject(event: StripeEventPayload) {
  return event.data?.object ?? {};
}

export function getStripeMetadataValue(object: Record<string, unknown>, key: string) {
  const metadata = object.metadata;

  if (typeof metadata !== "object" || metadata === null || !(key in metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

export function getStripeString(object: Record<string, unknown>, key: string) {
  const value = object[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

export function mapStripeSubscriptionStatus(status: string | null) {
  switch (status) {
    case "trialing":
      return ClientSubscriptionStatus.TRIALING;
    case "active":
      return ClientSubscriptionStatus.ACTIVE;
    case "past_due":
      return ClientSubscriptionStatus.PAST_DUE;
    case "canceled":
      return ClientSubscriptionStatus.CANCELED;
    case "unpaid":
      return ClientSubscriptionStatus.UNPAID;
    case "paused":
      return ClientSubscriptionStatus.PAUSED;
    case "incomplete_expired":
      return ClientSubscriptionStatus.INCOMPLETE_EXPIRED;
    case "incomplete":
    default:
      return ClientSubscriptionStatus.INCOMPLETE;
  }
}

export function getConnectStatusFromStripeObject(object: Record<string, unknown>) {
  return deriveConnectStatus({
    id: getStripeString(object, "id") ?? "unknown",
    details_submitted: object.details_submitted === true,
    charges_enabled: object.charges_enabled === true,
    payouts_enabled: object.payouts_enabled === true
  });
}

export function sanitizeStripeEventPayload(event: StripeEventPayload) {
  return redactSensitivePaymentFields(event) as StripeEventPayload;
}

export function getProcessedStatus() {
  return PaymentEventProcessingStatus.PROCESSED;
}

export function getIgnoredStatus() {
  return PaymentEventProcessingStatus.IGNORED;
}

export function getFailedStatus() {
  return PaymentEventProcessingStatus.FAILED;
}

function getSignatureTimestamp(header: string) {
  const timestamp = header
    .split(",")
    .map((part) => part.split("="))
    .find(([key]) => key === "t")?.[1];

  return timestamp ? Number(timestamp) : null;
}

function getSignatureValues(header: string) {
  return header
    .split(",")
    .map((part) => part.split("="))
    .filter(([key, value]) => key === "v1" && typeof value === "string")
    .map(([, value]) => value);
}

function parseJsonPayload(rawBody: string) {
  try {
    return JSON.parse(rawBody);
  } catch {
    throw new StripeWebhookPayloadError("Stripe webhook payload is not valid JSON.");
  }
}

function redactSensitivePaymentFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitivePaymentFields);
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => {
      if (["billing_details", "payment_method_details", "card", "client_secret"].includes(key)) {
        return [key, "[redacted]"];
      }

      return [key, redactSensitivePaymentFields(nestedValue)];
    })
  );
}
