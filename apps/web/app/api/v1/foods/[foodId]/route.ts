import { LibraryScope } from "@/app/generated/prisma/enums";
import { auth } from "@/auth";
import { dataResponse, errorResponse, handleApiError } from "@/lib/api/responses";
import { requireActiveActor } from "@/lib/auth/session-guards";
import { prisma } from "@/lib/db/prisma";
import { serializeFood } from "@/lib/nutrition/nutrition-records";

interface FoodRouteContext {
  params: Promise<{ foodId: string }>;
}

export async function GET(_request: Request, context: FoodRouteContext) {
  try {
    const actor = requireActiveActor(await auth(), "nutrition:read");
    const { foodId } = await context.params;
    const food = await prisma.foodLibraryItem.findFirst({
      where: {
        id: foodId,
        deletedAt: null,
        OR: [{ scope: LibraryScope.GLOBAL }, { organizationId: actor.organizationId }]
      }
    });

    if (!food) {
      return errorResponse("not_found", "Food not found.", 404);
    }

    return dataResponse(serializeFood(food));
  } catch (error) {
    return handleApiError(error);
  }
}
