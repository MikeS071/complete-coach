import { beforeEach, describe, expect, it, vi } from "vitest";

import { LibraryScope } from "@/app/generated/prisma/enums";
import { GET as getFoods, POST as createFood } from "@/app/api/v1/foods/route";
import { GET as getFood } from "@/app/api/v1/foods/[foodId]/route";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  prisma: {
    auditLog: { create: vi.fn() },
    foodLibraryItem: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn()
    }
  }
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: mocks.prisma
}));

const ownerSession = {
  user: { id: "user_1", email: "coach@example.com" },
  activeOrganization: {
    id: "org_1",
    slug: "complete-coach-demo",
    name: "Complete Coach Demo",
    role: "owner"
  }
};

const globalFood = {
  id: "food_global",
  organizationId: null,
  scope: LibraryScope.GLOBAL,
  name: "Basmati Rice",
  category: "Carbs",
  servingSize: "100g, Long Grain",
  calories: 121,
  proteinGrams: 3,
  carbsGrams: 25,
  fatGrams: 0.4,
  fiberGrams: 0.4,
  metadataJson: { source: "global" },
  createdAt: new Date("2026-05-18T00:00:00.000Z"),
  updatedAt: new Date("2026-05-18T00:00:00.000Z")
};

const privateFood = {
  ...globalFood,
  id: "food_private",
  organizationId: "org_1",
  scope: LibraryScope.PRIVATE,
  name: "Coach Chicken Breast",
  category: "Proteins",
  servingSize: "100g, Boneless",
  calories: 165,
  proteinGrams: 31,
  carbsGrams: 0,
  fatGrams: 3.6,
  metadataJson: { source: "coach" }
};

describe("nutrition persistence APIs", () => {
  beforeEach(() => {
    mocks.auth.mockReset();
    mocks.auth.mockResolvedValue(ownerSession);
    mocks.prisma.auditLog.create.mockReset();
    mocks.prisma.foodLibraryItem.create.mockReset();
    mocks.prisma.foodLibraryItem.findMany.mockReset();
    mocks.prisma.foodLibraryItem.findFirst.mockReset();
  });

  it("lists global and tenant private foods for the active organization", async () => {
    mocks.prisma.foodLibraryItem.findMany.mockResolvedValue([globalFood, privateFood]);

    const response = await getFoods(new Request("http://test.local/api/v1/foods?search=rice"));
    const payload = (await response.json()) as { data: Array<{ id: string; scope: string }> };

    expect(response.status).toBe(200);
    expect(payload.data).toEqual([
      expect.objectContaining({ id: "food_global", scope: "global" }),
      expect.objectContaining({ id: "food_private", scope: "private" })
    ]);
    expect(mocks.prisma.foodLibraryItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ scope: LibraryScope.GLOBAL }, { organizationId: "org_1" }]
        })
      })
    );
  });

  it("creates private tenant foods and audit logs the write", async () => {
    mocks.prisma.foodLibraryItem.create.mockResolvedValue(privateFood);

    const response = await createFood(
      new Request("http://test.local/api/v1/foods", {
        method: "POST",
        body: JSON.stringify({
          name: "Coach Chicken Breast",
          category: "Proteins",
          servingSize: "100g, Boneless",
          calories: 165,
          proteinGrams: 31,
          carbsGrams: 0,
          fatGrams: 3.6,
          fiberGrams: 0
        })
      })
    );
    const payload = (await response.json()) as { data: { id: string; scope: string } };

    expect(response.status).toBe(201);
    expect(payload.data).toEqual(expect.objectContaining({ id: "food_private", scope: "private" }));
    expect(mocks.prisma.foodLibraryItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "org_1",
          scope: LibraryScope.PRIVATE,
          createdByUserId: "user_1"
        })
      })
    );
    expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "food.created" })
      })
    );
  });

  it("rejects invalid macro values before persistence", async () => {
    const response = await createFood(
      new Request("http://test.local/api/v1/foods", {
        method: "POST",
        body: JSON.stringify({
          name: "Impossible Macro Food",
          category: "Custom",
          servingSize: "100g",
          calories: -1,
          proteinGrams: 10,
          carbsGrams: 10,
          fatGrams: 10
        })
      })
    );

    expect(response.status).toBe(422);
    expect(mocks.prisma.foodLibraryItem.create).not.toHaveBeenCalled();
  });

  it("reads one global food through tenant-scoped access", async () => {
    mocks.prisma.foodLibraryItem.findFirst.mockResolvedValue(globalFood);

    const response = await getFood(new Request("http://test.local/api/v1/foods/food_global"), {
      params: Promise.resolve({ foodId: "food_global" })
    });
    const payload = (await response.json()) as { data: { id: string; scope: string } };

    expect(response.status).toBe(200);
    expect(payload.data).toEqual(expect.objectContaining({ id: "food_global", scope: "global" }));
    expect(mocks.prisma.foodLibraryItem.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ scope: LibraryScope.GLOBAL }, { organizationId: "org_1" }]
        })
      })
    );
  });

  it("returns not found for inaccessible foods", async () => {
    mocks.prisma.foodLibraryItem.findFirst.mockResolvedValue(null);

    const response = await getFood(new Request("http://test.local/api/v1/foods/missing"), {
      params: Promise.resolve({ foodId: "missing" })
    });
    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(404);
    expect(payload.error.code).toBe("not_found");
  });
});
