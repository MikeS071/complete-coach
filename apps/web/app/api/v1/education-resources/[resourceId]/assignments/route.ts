import { auth } from "@/auth";
import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import {
  createEducationAssignmentSchema,
  serializeEducationAssignment
} from "@/lib/education/education-records";

interface RouteContext {
  params: Promise<{ resourceId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = requireActiveActor(await auth(), "education:assign");
    const { resourceId } = await context.params;
    const input = createEducationAssignmentSchema.parse(await request.json());
    const [resource, client] = await Promise.all([
      prisma.educationResource.findFirst({
        where: {
          id: resourceId,
          organizationId: actor.organizationId,
          deletedAt: null
        }
      }),
      prisma.client.findFirst({
        where: {
          id: input.clientId,
          organizationId: actor.organizationId,
          deletedAt: null
        }
      })
    ]);

    if (!resource) {
      return errorResponse("not_found", "Education resource not found.", 404);
    }

    if (!client) {
      return errorResponse("not_found", "Client not found.", 404);
    }

    const assignment = await prisma.educationResourceAssignment.create({
      data: {
        organizationId: actor.organizationId,
        resourceId: resource.id,
        clientId: client.id,
        assignedByUserId: actor.userId
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        organizationId: actor.organizationId,
        actorUserId: actor.userId,
        action: "education_resource_assignment.created",
        targetType: "education_resource_assignment",
        targetId: assignment.id,
        metadata: {
          resourceId: resource.id,
          clientId: client.id
        }
      }
    });

    return dataResponse(serializeEducationAssignment(assignment), {
      status: 201,
      headers: { Location: `/api/v1/education-resources/${resource.id}/assignments/${assignment.id}` }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
