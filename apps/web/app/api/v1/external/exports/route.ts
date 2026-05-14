import { NextResponse } from "next/server";
import { z } from "zod";
import type { InputJsonValue } from "@prisma/client/runtime/client";

import { ExternalWebhookDeliveryStatus, ExternalWebhookEndpointStatus } from "@/app/generated/prisma/enums";
import { handleApiError } from "@/lib/api/responses";
import { auditExternalApiUse, handleExternalApiError, requireExternalApiActor } from "@/lib/external/auth";
import { prisma } from "@/lib/db/prisma";
import {
  serializeExportJob,
  toPrismaExportFormat,
  toPrismaExportType,
  webhookEndpointSupportsEvent
} from "@/lib/external/webhooks";

const createExportSchema = z.object({
  type: z.enum(["metrics", "clients", "form-submissions", "check-ins"]),
  format: z.enum(["json", "jsonl", "csv"]),
  filters: z.record(z.string(), z.unknown()).optional()
});

const exportCreatedEvent = "external_export.created";

export async function POST(request: Request) {
  try {
    const { actor, ipAddress } = await requireExternalApiActor(request, "external:exports:read");
    const input = createExportSchema.parse(await request.json());
    const exportJob = await prisma.externalExportJob.create({
      data: {
        organizationId: actor.organizationId,
        apiKeyId: actor.apiKeyId,
        type: toPrismaExportType(input.type),
        format: toPrismaExportFormat(input.format),
        filters: input.filters as InputJsonValue | undefined
      }
    });

    const endpoints = await prisma.externalWebhookEndpoint.findMany({
      where: {
        organizationId: actor.organizationId,
        status: ExternalWebhookEndpointStatus.ACTIVE
      }
    });
    const subscribedEndpoints = endpoints.filter((endpoint) => webhookEndpointSupportsEvent(endpoint, exportCreatedEvent));

    if (subscribedEndpoints.length > 0) {
      await prisma.externalWebhookDelivery.createMany({
        data: subscribedEndpoints.map((endpoint) => ({
          organizationId: actor.organizationId,
          endpointId: endpoint.id,
          eventType: exportCreatedEvent,
          payloadJson: {
            eventType: exportCreatedEvent,
            exportId: exportJob.id,
            status: "queued"
          } as InputJsonValue,
          status: ExternalWebhookDeliveryStatus.PENDING,
          attemptCount: 0,
          nextRetryAt: null,
          lastError: null
        }))
      });
    }

    await auditExternalApiUse({ actor, request, ipAddress, targetType: "external_export", targetId: exportJob.id });
    await prisma.auditLog.create({
      data: {
        organizationId: actor.organizationId,
        actorApiKeyId: actor.apiKeyId,
        action: "external_export.created",
        targetType: "external_export",
        targetId: exportJob.id,
        metadata: {
          type: input.type,
          format: input.format,
          webhookDeliveryCount: subscribedEndpoints.length
        },
        ipAddress,
        userAgent: request.headers.get("user-agent")
      }
    });

    return NextResponse.json({ data: serializeExportJob(exportJob) }, { status: 201 });
  } catch (error) {
    try {
      return handleExternalApiError(error);
    } catch (apiError) {
      return handleApiError(apiError);
    }
  }
}
