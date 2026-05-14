import { NextResponse } from "next/server";

import { errorResponse, handleApiError } from "@/lib/api/responses";
import { auditExternalApiUse, handleExternalApiError, requireExternalApiActor } from "@/lib/external/auth";
import { prisma } from "@/lib/db/prisma";
import {
  buildExternalCursorWhere,
  buildExternalPage,
  externalMetricsQuerySchema,
  serializeExternalMetric
} from "@/lib/external/records";

export async function GET(request: Request, { params }: { params: Promise<{ externalClientId: string }> }) {
  try {
    const { actor, ipAddress } = await requireExternalApiActor(request, "external:metrics:read");
    const { externalClientId } = await params;
    const query = externalMetricsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const client = await prisma.client.findFirst({
      where: {
        organizationId: actor.organizationId,
        externalClientId,
        deletedAt: null
      }
    });

    if (!client) {
      return errorResponse("not_found", "External client was not found.", 404);
    }

    const metrics = await prisma.clientMeasurement.findMany({
      where: {
        organizationId: actor.organizationId,
        clientId: client.id,
        ...(query.metric_key ? { metricKey: query.metric_key } : {}),
        ...(query.source_type ? { sourceType: query.source_type } : {}),
        ...(query.from || query.to
          ? {
              measuredAt: {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(query.to ? { lte: new Date(query.to) } : {})
              }
            }
          : {}),
        ...buildExternalCursorWhere(query.cursor, "measuredAt")
      },
      include: { client: true },
      orderBy: [{ measuredAt: "desc" }, { id: "desc" }],
      take: query.limit + 1
    });

    await auditExternalApiUse({ actor, request, ipAddress, targetType: "client", targetId: externalClientId });

    return NextResponse.json(
      buildExternalPage(metrics, query.limit, (metric) => metric.measuredAt, serializeExternalMetric)
    );
  } catch (error) {
    try {
      return handleExternalApiError(error);
    } catch (apiError) {
      return handleApiError(apiError);
    }
  }
}
