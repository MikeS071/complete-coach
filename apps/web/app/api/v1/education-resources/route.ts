import { auth } from "@/auth";
import { dataResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import {
  buildEducationResourceWhere,
  createEducationResourceSchema,
  educationResourceListQuerySchema,
  getEducationResourceCreateData,
  serializeEducationResource
} from "@/lib/education/education-records";

export async function GET(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "education:read");
    const query = educationResourceListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const resources = await prisma.educationResource.findMany({
      where: buildEducationResourceWhere(actor.organizationId, query),
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      take: query.limit
    });

    return dataResponse(resources.map(serializeEducationResource));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = requireActiveActor(await auth(), "education:write");
    const input = createEducationResourceSchema.parse(await request.json());
    const resource = await prisma.educationResource.create({
      data: getEducationResourceCreateData(actor.organizationId, actor.userId, input)
    });

    await prisma.auditLog.create({
      data: {
        organizationId: actor.organizationId,
        actorUserId: actor.userId,
        action: "education_resource.created",
        targetType: "education_resource",
        targetId: resource.id,
        metadata: {
          category: input.category,
          resourceType: input.resourceType
        }
      }
    });

    return dataResponse(serializeEducationResource(resource), {
      status: 201,
      headers: { Location: `/api/v1/education-resources/${resource.id}` }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
