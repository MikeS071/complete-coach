import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/responses";
import { auditExternalApiUse, handleExternalApiError, requireExternalApiActor } from "@/lib/external/auth";
import { prisma } from "@/lib/db/prisma";
import {
  buildExternalCursorWhere,
  buildExternalPage,
  externalCheckInsQuerySchema,
  serializeExternalCheckIn,
  toExternalCheckInStatus
} from "@/lib/external/records";

export async function GET(request: Request) {
  try {
    const { actor, ipAddress } = await requireExternalApiActor(request, "external:submissions:read");
    const query = externalCheckInsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const checkIns = await prisma.checkIn.findMany({
      where: {
        organizationId: actor.organizationId,
        client: {
          deletedAt: null,
          externalClientId: { not: null }
        },
        ...(toExternalCheckInStatus(query.status) ? { status: toExternalCheckInStatus(query.status) } : {}),
        ...(query.submitted_since ? { submittedAt: { gte: new Date(query.submitted_since) } } : {}),
        ...(query.reviewed_since ? { reviewedAt: { gte: new Date(query.reviewed_since) } } : {}),
        ...buildExternalCursorWhere(query.cursor, "submittedAt")
      },
      include: {
        client: true,
        formSubmission: {
          include: {
            client: true,
            form: true,
            formVersion: true
          }
        }
      },
      orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
      take: query.limit + 1
    });

    await auditExternalApiUse({ actor, request, ipAddress, targetType: "check_in" });

    return NextResponse.json(
      buildExternalPage(checkIns, query.limit, (checkIn) => checkIn.submittedAt ?? checkIn.createdAt, serializeExternalCheckIn)
    );
  } catch (error) {
    try {
      return handleExternalApiError(error);
    } catch (apiError) {
      return handleApiError(apiError);
    }
  }
}
