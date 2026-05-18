import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { EmailDeliveryStatus } from "@/app/generated/prisma/enums";

export const notificationTypeValues = ["check-in", "message", "form", "task"] as const;

export const notificationListQuerySchema = z.object({
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

export const resendWebhookSchema = z.object({
  type: z.string().min(1),
  created_at: z.string().optional(),
  data: z
    .object({
      id: z.string().optional(),
      email_id: z.string().optional(),
      to: z.union([z.string(), z.array(z.string())]).optional(),
      subject: z.string().optional(),
      tags: z
        .array(
          z.object({
            name: z.string(),
            value: z.string()
          })
        )
        .optional(),
      error: z
        .object({
          message: z.string().optional()
        })
        .optional()
    })
    .passthrough()
});

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
export type ResendWebhookPayload = z.infer<typeof resendWebhookSchema>;

interface NotificationRecord {
  id: string;
  organizationId: string;
  recipientUserId: string | null;
  recipientClientId: string | null;
  type: string;
  title: string;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
}

interface EmailDeliveryRecord {
  id: string;
  organizationId: string;
  notificationId: string | null;
  provider: string;
  providerEmailId: string | null;
  toEmail: string;
  subject: string;
  status: EmailDeliveryStatus;
  eventType: string | null;
  errorMessage: string | null;
  metadata: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function buildNotificationWhere(organizationId: string, userId: string, query: NotificationListQuery) {
  return {
    organizationId,
    recipientUserId: userId,
    ...(query.unreadOnly ? { readAt: null } : {})
  };
}

export function serializeNotification(record: NotificationRecord) {
  return {
    id: record.id,
    type: normalizeNotificationType(record.type),
    title: record.title,
    message: record.body ?? "",
    entityType: record.entityType,
    entityId: record.entityId,
    unread: record.readAt === null,
    readAt: record.readAt ? toIsoString(record.readAt) : null,
    createdAt: toIsoString(record.createdAt)
  };
}

export function serializeEmailDelivery(record: EmailDeliveryRecord) {
  return {
    id: record.id,
    notificationId: record.notificationId,
    provider: record.provider,
    providerEmailId: record.providerEmailId,
    toEmail: record.toEmail,
    subject: record.subject,
    status: emailDeliveryStatusToApi(record.status),
    eventType: record.eventType,
    errorMessage: record.errorMessage,
    metadata: record.metadata,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt)
  };
}

export function emailDeliveryStatusToApi(status: EmailDeliveryStatus) {
  return status.toLowerCase();
}

export function mapResendEventToStatus(eventType: string) {
  switch (eventType) {
    case "email.sent":
      return EmailDeliveryStatus.SENT;
    case "email.delivered":
      return EmailDeliveryStatus.DELIVERED;
    case "email.bounced":
      return EmailDeliveryStatus.BOUNCED;
    case "email.complained":
      return EmailDeliveryStatus.COMPLAINED;
    case "email.failed":
      return EmailDeliveryStatus.FAILED;
    default:
      return EmailDeliveryStatus.SENT;
  }
}

export function getResendTag(payload: ResendWebhookPayload, name: string) {
  return payload.data.tags?.find((tag) => tag.name === name)?.value ?? null;
}

export function getResendProviderEmailId(payload: ResendWebhookPayload) {
  return payload.data.email_id ?? payload.data.id ?? null;
}

export function getResendRecipient(payload: ResendWebhookPayload) {
  if (Array.isArray(payload.data.to)) {
    return payload.data.to[0] ?? null;
  }

  return payload.data.to ?? null;
}

export function verifyResendWebhookSignature(payload: string, headers: Headers, secret: string) {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatureHeader = headers.get("svix-signature");

  if (!id || !timestamp || !signatureHeader) {
    return false;
  }

  const signedPayload = `${id}.${timestamp}.${payload}`;
  const normalizedSecret = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  const secretBytes = Buffer.from(normalizedSecret, "base64");
  const expectedSignature = createHmac("sha256", secretBytes).update(signedPayload).digest();

  return signatureHeader.split(" ").some((part) => {
    const signature = part.includes(",") ? part.split(",")[1] : part.replace(/^v1=/, "");

    if (!signature) {
      return false;
    }

    const receivedSignature = Buffer.from(signature, "base64");

    return (
      receivedSignature.length === expectedSignature.length &&
      timingSafeEqual(receivedSignature, expectedSignature)
    );
  });
}

function normalizeNotificationType(type: string) {
  return notificationTypeValues.includes(type as (typeof notificationTypeValues)[number]) ? type : "task";
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}
