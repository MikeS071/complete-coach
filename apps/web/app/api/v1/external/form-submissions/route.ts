import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/responses";
import { auditExternalApiUse, handleExternalApiError, requireExternalApiActor } from "@/lib/external/auth";
import { prisma } from "@/lib/db/prisma";
import {
  buildExternalCursorWhere,
  buildExternalPage,
  externalSubmissionsQuerySchema,
  serializeExternalSubmission,
  toExternalSubmissionStatus
} from "@/lib/external/records";

export async function GET(request: Request) {
  try {
    const { actor, ipAddress } = await requireExternalApiActor(request, "external:submissions:read");
    const query = externalSubmissionsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const submissions = await prisma.formSubmission.findMany({
      where: {
        organizationId: actor.organizationId,
        client: {
          deletedAt: null,
          externalClientId: { not: null }
        },
        ...(query.form_id ? { formId: query.form_id } : {}),
        ...(toExternalSubmissionStatus(query.status) ? { status: toExternalSubmissionStatus(query.status) } : {}),
        ...(query.submitted_since ? { submittedAt: { gte: new Date(query.submitted_since) } } : {}),
        ...buildExternalCursorWhere(query.cursor, "submittedAt")
      },
      include: {
        client: true,
        form: true,
        formVersion: true
      },
      orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
      take: query.limit + 1
    });

    await auditExternalApiUse({ actor, request, ipAddress, targetType: "form_submission" });

    return NextResponse.json(
      buildExternalPage(submissions, query.limit, (submission) => submission.submittedAt, serializeExternalSubmission)
    );
  } catch (error) {
    try {
      return handleExternalApiError(error);
    } catch (apiError) {
      return handleApiError(apiError);
    }
  }
}
