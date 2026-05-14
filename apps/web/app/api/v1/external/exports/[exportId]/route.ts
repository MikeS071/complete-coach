import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { auditExternalApiUse, handleExternalApiError, requireExternalApiActor } from "@/lib/external/auth";
import { prisma } from "@/lib/db/prisma";
import { serializeExportJob } from "@/lib/external/webhooks";

export async function GET(request: Request, { params }: { params: Promise<{ exportId: string }> }) {
  try {
    const { actor, ipAddress } = await requireExternalApiActor(request, "external:exports:read");
    const { exportId } = await params;
    const exportJob = await prisma.externalExportJob.findFirst({
      where: {
        id: exportId,
        organizationId: actor.organizationId
      }
    });

    if (!exportJob) {
      return errorResponse("not_found", "Export job was not found.", 404);
    }

    await auditExternalApiUse({ actor, request, ipAddress, targetType: "external_export", targetId: exportId });

    return dataResponse(serializeExportJob(exportJob));
  } catch (error) {
    try {
      return handleExternalApiError(error);
    } catch (apiError) {
      return handleApiError(apiError);
    }
  }
}
