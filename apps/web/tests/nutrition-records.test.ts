import { describe, expect, it } from "vitest";

import { LibraryScope } from "@/app/generated/prisma/enums";
import {
  buildFoodWhere,
  createFoodSchema,
  getFoodCreateData,
  serializeFood,
  toPrismaFoodLibraryScope
} from "@/lib/nutrition/nutrition-records";

describe("nutrition record mappers", () => {
  it("maps public food scope values to Prisma enums", () => {
    expect(toPrismaFoodLibraryScope("global")).toBe(LibraryScope.GLOBAL);
    expect(toPrismaFoodLibraryScope("private")).toBe(LibraryScope.PRIVATE);
  });

  it("builds scoped food filters with optional facets", () => {
    expect(buildFoodWhere("org_1", { limit: 50 })).toMatchObject({
      deletedAt: null,
      OR: [{ scope: LibraryScope.GLOBAL }, { organizationId: "org_1" }]
    });

    expect(
      buildFoodWhere("org_1", {
        scope: "private",
        category: "Proteins",
        search: "chicken",
        limit: 100
      })
    ).toMatchObject({
      scope: LibraryScope.PRIVATE,
      category: "Proteins",
      AND: [
        {
          OR: [
            { name: { contains: "chicken", mode: "insensitive" } },
            { category: { contains: "chicken", mode: "insensitive" } },
            { servingSize: { contains: "chicken", mode: "insensitive" } }
          ]
        }
      ]
    });
  });

  it("normalizes food create payloads", () => {
    const input = createFoodSchema.parse({
      name: "Chicken Breast",
      category: "Proteins",
      servingSize: "100g, Boneless",
      calories: 165,
      proteinGrams: 31,
      carbsGrams: 0,
      fatGrams: 3.6,
      fiberGrams: 0,
      metadata: { source: "coach" }
    });

    expect(getFoodCreateData("org_1", "user_1", input)).toMatchObject({
      organizationId: "org_1",
      createdByUserId: "user_1",
      scope: LibraryScope.PRIVATE,
      name: "Chicken Breast",
      proteinGrams: 31,
      metadataJson: { source: "coach" }
    });
  });

  it("serializes foods across global/private and nullable branches", () => {
    expect(
      serializeFood({
        id: "food_global",
        organizationId: null,
        scope: LibraryScope.GLOBAL,
        name: "Basmati Rice",
        category: "Carbs",
        servingSize: "100g, Long Grain",
        calories: 121,
        proteinGrams: "3.00",
        carbsGrams: "25.00",
        fatGrams: "0.40",
        fiberGrams: null,
        metadataJson: null,
        createdAt: new Date("2026-05-18T00:00:00.000Z"),
        updatedAt: "2026-05-18T01:00:00.000Z"
      })
    ).toMatchObject({
      id: "food_global",
      organizationId: null,
      scope: "global",
      proteinGrams: 3,
      carbsGrams: 25,
      fatGrams: 0.4,
      fiberGrams: null,
      metadata: null,
      createdAt: "2026-05-18T00:00:00.000Z",
      updatedAt: "2026-05-18T01:00:00.000Z"
    });
  });
});
