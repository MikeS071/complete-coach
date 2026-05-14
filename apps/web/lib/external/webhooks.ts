import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { compare, hash } from "bcryptjs";

import {
  ExternalExportFormat,
  ExternalExportStatus,
  ExternalExportType,
  ExternalWebhookEndpointStatus
} from "@/app/generated/prisma/enums";

interface WebhookSignatureInput {
  payload: string;
  secret: string;
  timestamp: number;
}

export function buildWebhookSignature({ payload, secret, timestamp }: WebhookSignatureInput) {
  const digest = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");

  return `v1=${digest}`;
}

export function verifyWebhookSignature(input: WebhookSignatureInput & { signature: string }) {
  const expected = buildWebhookSignature(input);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(input.signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function createWebhookSigningSecret() {
  return `whsec_${randomBytes(32).toString("base64url")}`;
}

export async function hashWebhookSigningSecret(secret: string) {
  return hash(secret, 12);
}

export async function verifyWebhookSigningSecret(secret: string, secretHash: string) {
  return compare(secret, secretHash);
}

interface ExportJobRecord {
  id: string;
  type: ExternalExportType | string;
  format: ExternalExportFormat | string;
  filters: unknown;
  status: ExternalExportStatus | string;
  errorMessage: string | null;
  resultObjectKey?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt: Date | string | null;
}

interface WebhookEndpointRecord {
  id: string;
  url: string;
  description: string | null;
  eventTypes: unknown;
  status: ExternalWebhookEndpointStatus | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function serializeExportJob(record: ExportJobRecord) {
  return {
    exportId: record.id,
    type: serializeExportType(record.type),
    format: serializeExportFormat(record.format),
    filters: record.filters,
    status: serializeExportStatus(record.status),
    errorMessage: record.errorMessage,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
    completedAt: record.completedAt ? toIsoString(record.completedAt) : null,
    ...(record.status === ExternalExportStatus.COMPLETED || record.status === "COMPLETED" || record.status === "completed"
      ? { downloadUrl: `/api/v1/external/exports/${record.id}/download` }
      : {})
  };
}

export function serializeWebhookEndpoint(record: WebhookEndpointRecord) {
  return {
    id: record.id,
    url: record.url,
    description: record.description,
    eventTypes: normalizeEventTypes(record.eventTypes),
    status: serializeWebhookEndpointStatus(record.status),
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt)
  };
}

export function toPrismaExportType(type: string) {
  const typeMap: Record<string, ExternalExportType> = {
    metrics: ExternalExportType.METRICS,
    clients: ExternalExportType.CLIENTS,
    "form-submissions": ExternalExportType.FORM_SUBMISSIONS,
    "check-ins": ExternalExportType.CHECK_INS
  };

  return typeMap[type];
}

export function toPrismaExportFormat(format: string) {
  const formatMap: Record<string, ExternalExportFormat> = {
    json: ExternalExportFormat.JSON,
    jsonl: ExternalExportFormat.JSONL,
    csv: ExternalExportFormat.CSV
  };

  return formatMap[format];
}

export function toPrismaWebhookEndpointStatus(status: string | undefined) {
  const statusMap: Record<string, ExternalWebhookEndpointStatus> = {
    active: ExternalWebhookEndpointStatus.ACTIVE,
    disabled: ExternalWebhookEndpointStatus.DISABLED
  };

  return status ? statusMap[status] : undefined;
}

export function webhookEndpointSupportsEvent(endpoint: { eventTypes: unknown }, eventType: string) {
  return normalizeEventTypes(endpoint.eventTypes).includes(eventType);
}

function normalizeEventTypes(eventTypes: unknown) {
  return Array.isArray(eventTypes) ? eventTypes.filter((eventType): eventType is string => typeof eventType === "string") : [];
}

function serializeExportType(type: ExternalExportType | string) {
  const typeMap: Record<ExternalExportType, string> = {
    [ExternalExportType.METRICS]: "metrics",
    [ExternalExportType.CLIENTS]: "clients",
    [ExternalExportType.FORM_SUBMISSIONS]: "form-submissions",
    [ExternalExportType.CHECK_INS]: "check-ins"
  };

  return typeMap[type as ExternalExportType] ?? type;
}

function serializeExportFormat(format: ExternalExportFormat | string) {
  const formatMap: Record<ExternalExportFormat, string> = {
    [ExternalExportFormat.JSON]: "json",
    [ExternalExportFormat.JSONL]: "jsonl",
    [ExternalExportFormat.CSV]: "csv"
  };

  return formatMap[format as ExternalExportFormat] ?? format;
}

function serializeExportStatus(status: ExternalExportStatus | string) {
  const statusMap: Record<ExternalExportStatus, string> = {
    [ExternalExportStatus.QUEUED]: "queued",
    [ExternalExportStatus.RUNNING]: "running",
    [ExternalExportStatus.COMPLETED]: "completed",
    [ExternalExportStatus.FAILED]: "failed"
  };

  return statusMap[status as ExternalExportStatus] ?? status;
}

function serializeWebhookEndpointStatus(status: ExternalWebhookEndpointStatus | string) {
  const statusMap: Record<ExternalWebhookEndpointStatus, string> = {
    [ExternalWebhookEndpointStatus.ACTIVE]: "active",
    [ExternalWebhookEndpointStatus.DISABLED]: "disabled"
  };

  return statusMap[status as ExternalWebhookEndpointStatus] ?? status;
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
