import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/responses";
import { auditExternalApiUse, handleExternalApiError, requireExternalApiActor } from "@/lib/external/auth";
import { prisma } from "@/lib/db/prisma";
import {
  buildExternalCursorWhere,
  buildExternalPage,
  externalMetricsQuerySchema,
  serializeExternalMetric,
  splitExternalClientIds
} from "@/lib/external/records";

export async function GET(request: Request) {
  try {
    const { actor, ipAddress } = await requireExternalApiActor(request, "external:metrics:read");
    const query = externalMetricsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const externalClientIds = splitExternalClientIds(query.client_external_ids);
    const metrics = await prisma.clientMeasurement.findMany({
      where: {
        organizationId: actor.organizationId,
        client: {
          deletedAt: null,
          externalClientId: externalClientIds.length > 0 ? { in: externalClientIds } : { not: null }
        },
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

    await auditExternalApiUse({ actor, request, ipAddress, targetType: "metric" });

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
