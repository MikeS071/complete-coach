import { NextResponse } from "next/server";
import { z } from "zod";
import type { InputJsonValue } from "@prisma/client/runtime/client";

import { handleApiError } from "@/lib/api/responses";
import { auditExternalApiUse, handleExternalApiError, requireExternalApiActor } from "@/lib/external/auth";
import { prisma } from "@/lib/db/prisma";
import {
  createWebhookSigningSecret,
  hashWebhookSigningSecret,
  serializeWebhookEndpoint,
  toPrismaWebhookEndpointStatus
} from "@/lib/external/webhooks";

const eventTypeSchema = z.enum([
  "external_export.created",
  "external_export.completed",
  "external_export.failed",
  "metric.extracted",
  "check_in.reviewed",
  "check_in.completed"
]);

const createWebhookEndpointSchema = z.object({
  url: z.string().url().refine((url) => new URL(url).protocol === "https:", "Webhook URL must use HTTPS."),
  description: z.string().trim().max(500).optional(),
  eventTypes: z.array(eventTypeSchema).min(1).max(20)
});

const webhookEndpointListQuerySchema = z.object({
  status: z.enum(["active", "disabled"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

export async function GET(request: Request) {
  try {
    const { actor, ipAddress } = await requireExternalApiActor(request, "external:webhooks:manage");
    const query = webhookEndpointListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const endpoints = await prisma.externalWebhookEndpoint.findMany({
      where: {
        organizationId: actor.organizationId,
        ...(toPrismaWebhookEndpointStatus(query.status) ? { status: toPrismaWebhookEndpointStatus(query.status) } : {})
      },
      orderBy: [{ createdAt: "desc" }],
      take: query.limit
    });

    await auditExternalApiUse({ actor, request, ipAddress, targetType: "external_webhook_endpoint" });

    return NextResponse.json({ data: endpoints.map(serializeWebhookEndpoint) });
  } catch (error) {
    try {
      return handleExternalApiError(error);
    } catch (apiError) {
      return handleApiError(apiError);
    }
  }
}

export async function POST(request: Request) {
  try {
    const { actor, ipAddress } = await requireExternalApiActor(request, "external:webhooks:manage");
    const input = createWebhookEndpointSchema.parse(await request.json());
    const signingSecret = createWebhookSigningSecret();
    const signingSecretHash = await hashWebhookSigningSecret(signingSecret);
    const endpoint = await prisma.externalWebhookEndpoint.create({
      data: {
        organizationId: actor.organizationId,
        url: input.url,
        description: input.description ?? null,
        eventTypes: input.eventTypes as InputJsonValue,
        signingSecretHash
      }
    });

    await auditExternalApiUse({
      actor,
      request,
      ipAddress,
      targetType: "external_webhook_endpoint",
      targetId: endpoint.id
    });
    await prisma.auditLog.create({
      data: {
        organizationId: actor.organizationId,
        actorApiKeyId: actor.apiKeyId,
        action: "external_webhook_endpoint.created",
        targetType: "external_webhook_endpoint",
        targetId: endpoint.id,
        metadata: {
          eventTypes: input.eventTypes
        },
        ipAddress,
        userAgent: request.headers.get("user-agent")
      }
    });

    return NextResponse.json(
      {
        data: {
          ...serializeWebhookEndpoint(endpoint),
          signingSecret
        }
      },
      { status: 201 }
    );
  } catch (error) {
    try {
      return handleExternalApiError(error);
    } catch (apiError) {
      return handleApiError(apiError);
    }
  }
}
