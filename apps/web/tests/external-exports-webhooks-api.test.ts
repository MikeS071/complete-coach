import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ExternalApiKeyStatus,
  ExternalExportFormat,
  ExternalExportStatus,
  ExternalExportType,
  ExternalWebhookEndpointStatus,
  ExternalWebhookDeliveryStatus
} from "@/app/generated/prisma/enums";
import { POST as createExport } from "@/app/api/v1/external/exports/route";
import { GET as getExport } from "@/app/api/v1/external/exports/[exportId]/route";
import { GET as listWebhookEndpoints, POST as createWebhookEndpoint } from "@/app/api/v1/external/webhook-endpoints/route";
import { DELETE as disableWebhookEndpoint, PATCH as updateWebhookEndpoint } from "@/app/api/v1/external/webhook-endpoints/[endpointId]/route";
import { clearExternalRateLimitBuckets } from "@/lib/external/auth";
import {
  createWebhookSigningSecret,
  buildWebhookSignature,
  hashWebhookSigningSecret,
  serializeExportJob,
  serializeWebhookEndpoint,
  verifyWebhookSigningSecret,
  verifyWebhookSignature,
  toPrismaExportFormat,
  toPrismaExportType,
  toPrismaWebhookEndpointStatus,
  webhookEndpointSupportsEvent
} from "@/lib/external/webhooks";

const mocks = vi.hoisted(() => ({
  verifyExternalApiKey: vi.fn(),
  prisma: {
    auditLog: { create: vi.fn() },
    externalApiKey: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    externalExportJob: {
      create: vi.fn(),
      findFirst: vi.fn()
    },
    externalWebhookEndpoint: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn()
    },
    externalWebhookDelivery: {
      createMany: vi.fn()
    }
  }
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: mocks.prisma
}));

vi.mock("@/lib/external/api-keys", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/external/api-keys")>();

  return {
    ...original,
    verifyExternalApiKey: mocks.verifyExternalApiKey
  };
});

const apiSecret = "cc_test_valid_secret_for_external_api_tests";
const apiKeyRecord = {
  id: "api_key_1",
  organizationId: "org_1",
  name: "Analytics",
  keyPrefix: apiSecret.slice(0, 16),
  keyHash: "hashed-secret",
  scopes: ["external:exports:read", "external:webhooks:manage"],
  status: ExternalApiKeyStatus.ACTIVE,
  allowedIps: null,
  expiresAt: null,
  revokedAt: null,
  lastUsedAt: null,
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  updatedAt: new Date("2026-05-14T00:00:00.000Z")
};

const exportJobRecord = {
  id: "export_1",
  organizationId: "org_1",
  apiKeyId: "api_key_1",
  type: ExternalExportType.METRICS,
  format: ExternalExportFormat.JSONL,
  filters: { from: "2026-01-01T00:00:00.000Z" },
  status: ExternalExportStatus.QUEUED,
  resultObjectKey: null,
  errorMessage: null,
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  updatedAt: new Date("2026-05-14T00:00:00.000Z"),
  completedAt: null
};

const webhookEndpointRecord = {
  id: "webhook_1",
  organizationId: "org_1",
  url: "https://analysis.example.com/webhooks/complete-coach",
  description: "Analytics webhook",
  eventTypes: ["external_export.created"],
  signingSecretHash: "hashed-webhook-secret",
  status: ExternalWebhookEndpointStatus.ACTIVE,
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  updatedAt: new Date("2026-05-14T00:00:00.000Z")
};

function externalRequest(url: string, init: RequestInit = {}) {
  return new Request(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiSecret}`,
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.10",
      ...(init.headers ?? {})
    }
  });
}

describe("external export and webhook APIs", () => {
  beforeEach(() => {
    clearExternalRateLimitBuckets();
    mocks.verifyExternalApiKey.mockReset();
    mocks.verifyExternalApiKey.mockResolvedValue(true);
    mocks.prisma.auditLog.create.mockReset();
    mocks.prisma.auditLog.create.mockResolvedValue({});
    mocks.prisma.externalApiKey.findUnique.mockReset();
    mocks.prisma.externalApiKey.findUnique.mockResolvedValue(apiKeyRecord);
    mocks.prisma.externalApiKey.update.mockReset();
    mocks.prisma.externalApiKey.update.mockResolvedValue(apiKeyRecord);
    mocks.prisma.externalExportJob.create.mockReset();
    mocks.prisma.externalExportJob.findFirst.mockReset();
    mocks.prisma.externalWebhookEndpoint.create.mockReset();
    mocks.prisma.externalWebhookEndpoint.findMany.mockReset();
    mocks.prisma.externalWebhookEndpoint.findFirst.mockReset();
    mocks.prisma.externalWebhookEndpoint.update.mockReset();
    mocks.prisma.externalWebhookDelivery.createMany.mockReset();
  });

  it("creates a queued export job and pending webhook delivery records", async () => {
    mocks.prisma.externalExportJob.create.mockResolvedValue(exportJobRecord);
    mocks.prisma.externalWebhookEndpoint.findMany.mockResolvedValue([webhookEndpointRecord]);
    mocks.prisma.externalWebhookDelivery.createMany.mockResolvedValue({ count: 1 });

    const response = await createExport(
      externalRequest("http://test.local/api/v1/external/exports", {
        method: "POST",
        body: JSON.stringify({
          type: "metrics",
          format: "jsonl",
          filters: { from: "2026-01-01T00:00:00.000Z" }
        })
      })
    );
    const payload = (await response.json()) as { data: { exportId: string; status: string } };

    expect(response.status).toBe(201);
    expect(payload.data).toEqual(expect.objectContaining({ exportId: "export_1", status: "queued" }));
    expect(mocks.prisma.externalExportJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "org_1",
          apiKeyId: "api_key_1",
          type: ExternalExportType.METRICS,
          format: ExternalExportFormat.JSONL
        })
      })
    );
    expect(mocks.prisma.externalWebhookDelivery.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          endpointId: "webhook_1",
          eventType: "external_export.created",
          status: ExternalWebhookDeliveryStatus.PENDING,
          attemptCount: 0,
          nextRetryAt: null,
          lastError: null
        })
      ]
    });
    expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "external_export.created",
          actorApiKeyId: "api_key_1",
          targetId: "export_1"
        })
      })
    );
  });

  it("creates export jobs without webhook deliveries when no endpoint is subscribed", async () => {
    mocks.prisma.externalExportJob.create.mockResolvedValue({ ...exportJobRecord, type: ExternalExportType.CLIENTS });
    mocks.prisma.externalWebhookEndpoint.findMany.mockResolvedValue([
      { ...webhookEndpointRecord, eventTypes: ["metric.extracted"] }
    ]);

    const response = await createExport(
      externalRequest("http://test.local/api/v1/external/exports", {
        method: "POST",
        body: JSON.stringify({
          type: "clients",
          format: "json"
        })
      })
    );

    expect(response.status).toBe(201);
    expect(mocks.prisma.externalWebhookDelivery.createMany).not.toHaveBeenCalled();
  });

  it("returns export status without exposing internal storage keys unless completed", async () => {
    mocks.prisma.externalExportJob.findFirst
      .mockResolvedValueOnce(exportJobRecord)
      .mockResolvedValueOnce({
        ...exportJobRecord,
        status: ExternalExportStatus.COMPLETED,
        resultObjectKey: "private/export/path.jsonl",
        completedAt: new Date("2026-05-14T00:05:00.000Z")
      });

    const queuedResponse = await getExport(externalRequest("http://test.local/api/v1/external/exports/export_1"), {
      params: Promise.resolve({ exportId: "export_1" })
    });
    const completedResponse = await getExport(externalRequest("http://test.local/api/v1/external/exports/export_1"), {
      params: Promise.resolve({ exportId: "export_1" })
    });
    const queuedPayload = (await queuedResponse.json()) as { data: Record<string, unknown> };
    const completedPayload = (await completedResponse.json()) as { data: Record<string, unknown> };

    expect(queuedResponse.status).toBe(200);
    expect(queuedPayload.data).not.toHaveProperty("resultObjectKey");
    expect(queuedPayload.data).not.toHaveProperty("downloadUrl");
    expect(completedPayload.data).toEqual(
      expect.objectContaining({
        status: "completed",
        downloadUrl: "/api/v1/external/exports/export_1/download"
      })
    );
    expect(completedPayload.data).not.toHaveProperty("resultObjectKey");
  });

  it("creates webhook endpoints and returns signing secrets only once", async () => {
    mocks.prisma.externalWebhookEndpoint.create.mockResolvedValue(webhookEndpointRecord);

    const response = await createWebhookEndpoint(
      externalRequest("http://test.local/api/v1/external/webhook-endpoints", {
        method: "POST",
        body: JSON.stringify({
          url: webhookEndpointRecord.url,
          description: "Analytics webhook",
          eventTypes: ["external_export.created", "metric.extracted"]
        })
      })
    );
    const payload = (await response.json()) as { data: Record<string, unknown> };

    expect(response.status).toBe(201);
    expect(payload.data).toEqual(
      expect.objectContaining({
        id: "webhook_1",
        signingSecret: expect.stringMatching(/^whsec_/)
      })
    );
    expect(payload.data).not.toHaveProperty("signingSecretHash");
    expect(mocks.prisma.externalWebhookEndpoint.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          signingSecretHash: expect.any(String),
          eventTypes: ["external_export.created", "metric.extracted"]
        })
      })
    );
  });

  it("lists, updates, and disables webhook endpoints without returning secrets", async () => {
    mocks.prisma.externalWebhookEndpoint.findMany.mockResolvedValue([webhookEndpointRecord]);
    mocks.prisma.externalWebhookEndpoint.findFirst.mockResolvedValue(webhookEndpointRecord);
    mocks.prisma.externalWebhookEndpoint.update
      .mockResolvedValueOnce({ ...webhookEndpointRecord, description: "Updated" })
      .mockResolvedValueOnce({ ...webhookEndpointRecord, status: ExternalWebhookEndpointStatus.DISABLED });

    const listResponse = await listWebhookEndpoints(
      externalRequest("http://test.local/api/v1/external/webhook-endpoints?status=active")
    );
    const updateResponse = await updateWebhookEndpoint(
      externalRequest("http://test.local/api/v1/external/webhook-endpoints/webhook_1", {
        method: "PATCH",
        body: JSON.stringify({ description: "Updated", eventTypes: ["external_export.completed"] })
      }),
      { params: Promise.resolve({ endpointId: "webhook_1" }) }
    );
    const disableResponse = await disableWebhookEndpoint(
      externalRequest("http://test.local/api/v1/external/webhook-endpoints/webhook_1", { method: "DELETE" }),
      { params: Promise.resolve({ endpointId: "webhook_1" }) }
    );
    const listPayload = (await listResponse.json()) as { data: Array<Record<string, unknown>> };

    expect(listResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(disableResponse.status).toBe(200);
    expect(listPayload.data[0]).not.toHaveProperty("signingSecret");
    expect(listPayload.data[0]).not.toHaveProperty("signingSecretHash");
    expect(mocks.prisma.externalWebhookEndpoint.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ eventTypes: ["external_export.completed"] })
      })
    );
    expect(mocks.prisma.externalWebhookEndpoint.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: { status: ExternalWebhookEndpointStatus.DISABLED }
      })
    );
  });

  it("supports default webhook list filters and partial URL updates", async () => {
    mocks.prisma.externalWebhookEndpoint.findMany.mockResolvedValue([
      { ...webhookEndpointRecord, status: ExternalWebhookEndpointStatus.DISABLED }
    ]);
    mocks.prisma.externalWebhookEndpoint.findFirst.mockResolvedValue(webhookEndpointRecord);
    mocks.prisma.externalWebhookEndpoint.update.mockResolvedValue({
      ...webhookEndpointRecord,
      url: "https://analysis.example.com/updated"
    });

    const listResponse = await listWebhookEndpoints(
      externalRequest("http://test.local/api/v1/external/webhook-endpoints")
    );
    const updateResponse = await updateWebhookEndpoint(
      externalRequest("http://test.local/api/v1/external/webhook-endpoints/webhook_1", {
        method: "PATCH",
        body: JSON.stringify({ url: "https://analysis.example.com/updated", description: null })
      }),
      { params: Promise.resolve({ endpointId: "webhook_1" }) }
    );

    expect(listResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(mocks.prisma.externalWebhookEndpoint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 50,
        where: { organizationId: "org_1" }
      })
    );
    expect(mocks.prisma.externalWebhookEndpoint.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ url: "https://analysis.example.com/updated", description: null })
      })
    );
  });

  it("enforces scopes, validation, and tenant ownership", async () => {
    mocks.prisma.externalApiKey.findUnique
      .mockResolvedValueOnce({ ...apiKeyRecord, scopes: ["external:metrics:read"] })
      .mockResolvedValue(apiKeyRecord);
    mocks.prisma.externalExportJob.findFirst.mockResolvedValue(null);
    mocks.prisma.externalWebhookEndpoint.findFirst.mockResolvedValue(null);

    const forbiddenResponse = await createExport(
      externalRequest("http://test.local/api/v1/external/exports", {
        method: "POST",
        body: JSON.stringify({ type: "metrics", format: "json" })
      })
    );
    const invalidWebhookResponse = await createWebhookEndpoint(
      externalRequest("http://test.local/api/v1/external/webhook-endpoints", {
        method: "POST",
        body: JSON.stringify({ url: "http://not-tls.example.com", eventTypes: [] })
      })
    );
    const missingExportResponse = await getExport(externalRequest("http://test.local/api/v1/external/exports/missing"), {
      params: Promise.resolve({ exportId: "missing" })
    });
    const missingEndpointResponse = await updateWebhookEndpoint(
      externalRequest("http://test.local/api/v1/external/webhook-endpoints/missing", {
        method: "PATCH",
        body: JSON.stringify({ description: "Missing" })
      }),
      { params: Promise.resolve({ endpointId: "missing" }) }
    );
    const missingDeleteResponse = await disableWebhookEndpoint(
      externalRequest("http://test.local/api/v1/external/webhook-endpoints/missing", { method: "DELETE" }),
      { params: Promise.resolve({ endpointId: "missing" }) }
    );

    expect(forbiddenResponse.status).toBe(403);
    expect(invalidWebhookResponse.status).toBe(422);
    expect(missingExportResponse.status).toBe(404);
    expect(missingEndpointResponse.status).toBe(404);
    expect(missingDeleteResponse.status).toBe(404);
  });

  it("converts export and webhook route auth failures through external error handling", async () => {
    mocks.prisma.externalApiKey.findUnique.mockResolvedValue({ ...apiKeyRecord, scopes: [] });

    const getExportForbidden = await getExport(externalRequest("http://test.local/api/v1/external/exports/export_1"), {
      params: Promise.resolve({ exportId: "export_1" })
    });
    const listWebhookForbidden = await listWebhookEndpoints(
      externalRequest("http://test.local/api/v1/external/webhook-endpoints")
    );
    const deleteWebhookForbidden = await disableWebhookEndpoint(
      externalRequest("http://test.local/api/v1/external/webhook-endpoints/webhook_1", { method: "DELETE" }),
      { params: Promise.resolve({ endpointId: "webhook_1" }) }
    );

    expect(getExportForbidden.status).toBe(403);
    expect(listWebhookForbidden.status).toBe(403);
    expect(deleteWebhookForbidden.status).toBe(403);
  });

  it("serializes domain records and verifies webhook secrets", async () => {
    const signingSecret = createWebhookSigningSecret();
    const signingSecretHash = await hashWebhookSigningSecret(signingSecret);
    const signature = buildWebhookSignature({ payload: "{}", secret: signingSecret, timestamp: 1777248000 });

    await expect(verifyWebhookSigningSecret(signingSecret, signingSecretHash)).resolves.toBe(true);
    expect(
      verifyWebhookSignature({ payload: "{}", secret: signingSecret, timestamp: 1777248000, signature: "v1=short" })
    ).toBe(false);
    expect(verifyWebhookSignature({ payload: "{}", secret: signingSecret, timestamp: 1777248000, signature })).toBe(true);
    expect(serializeExportJob({ ...exportJobRecord, status: ExternalExportStatus.FAILED, errorMessage: "failed" })).toEqual(
      expect.objectContaining({ status: "failed", errorMessage: "failed" })
    );
    expect(serializeExportJob({ ...exportJobRecord, type: "CUSTOM", format: "CUSTOM", status: "CUSTOM" })).toEqual(
      expect.objectContaining({ type: "CUSTOM", format: "CUSTOM", status: "CUSTOM" })
    );
    expect(serializeWebhookEndpoint({ ...webhookEndpointRecord, status: "CUSTOM" })).toEqual(
      expect.objectContaining({ status: "CUSTOM" })
    );
    expect(serializeWebhookEndpoint({ ...webhookEndpointRecord, eventTypes: [123, "metric.extracted"] })).toEqual(
      expect.objectContaining({ eventTypes: ["metric.extracted"] })
    );
    expect(toPrismaExportType("unknown")).toBeUndefined();
    expect(toPrismaExportFormat("unknown")).toBeUndefined();
    expect(toPrismaWebhookEndpointStatus(undefined)).toBeUndefined();
    expect(webhookEndpointSupportsEvent({ eventTypes: "metric.extracted" }, "metric.extracted")).toBe(false);
  });
});
