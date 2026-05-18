import { z } from "zod";
import type { InputJsonValue } from "@prisma/client/runtime/client";

import { LibraryScope } from "@/app/generated/prisma/enums";

export const foodLibraryScopeValues = ["global", "private"] as const;
export type ApiFoodLibraryScope = (typeof foodLibraryScopeValues)[number];

const foodLibraryScopeToPrisma: Record<ApiFoodLibraryScope, LibraryScope> = {
  global: LibraryScope.GLOBAL,
  private: LibraryScope.PRIVATE
};

const foodLibraryScopeFromPrisma: Record<LibraryScope, ApiFoodLibraryScope> = {
  [LibraryScope.GLOBAL]: "global",
  [LibraryScope.PRIVATE]: "private"
};

export const foodListQuerySchema = z.object({
  scope: z.enum(foodLibraryScopeValues).optional(),
  category: z.string().trim().max(80).optional(),
  search: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

export const createFoodSchema = z.object({
  name: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80),
  servingSize: z.string().trim().min(1).max(120),
  calories: z.number().int().min(0).max(20_000),
  proteinGrams: z.number().min(0).max(5_000),
  carbsGrams: z.number().min(0).max(5_000),
  fatGrams: z.number().min(0).max(5_000),
  fiberGrams: z.number().min(0).max(1_000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export type FoodListQuery = z.infer<typeof foodListQuerySchema>;
export type CreateFoodInput = z.infer<typeof createFoodSchema>;

interface FoodRecord {
  id: string;
  organizationId: string | null;
  scope: LibraryScope;
  name: string;
  category: string;
  servingSize: string;
  calories: number;
  proteinGrams: unknown;
  carbsGrams: unknown;
  fatGrams: unknown;
  fiberGrams: unknown;
  metadataJson: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function toPrismaFoodLibraryScope(scope: ApiFoodLibraryScope) {
  return foodLibraryScopeToPrisma[scope];
}

export function buildFoodWhere(organizationId: string, query: FoodListQuery) {
  return {
    deletedAt: null,
    OR: [{ scope: LibraryScope.GLOBAL }, { organizationId }],
    ...(query.scope ? { scope: toPrismaFoodLibraryScope(query.scope) } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.search
      ? {
          AND: [
            {
              OR: [
                { name: { contains: query.search, mode: "insensitive" as const } },
                { category: { contains: query.search, mode: "insensitive" as const } },
                { servingSize: { contains: query.search, mode: "insensitive" as const } }
              ]
            }
          ]
        }
      : {})
  };
}

export function getFoodCreateData(organizationId: string, userId: string, input: CreateFoodInput) {
  return {
    organizationId,
    createdByUserId: userId,
    scope: LibraryScope.PRIVATE,
    name: input.name,
    category: input.category,
    servingSize: input.servingSize,
    calories: input.calories,
    proteinGrams: input.proteinGrams,
    carbsGrams: input.carbsGrams,
    fatGrams: input.fatGrams,
    fiberGrams: input.fiberGrams,
    metadataJson: input.metadata as InputJsonValue | undefined
  };
}

export function serializeFood(record: FoodRecord) {
  return {
    id: record.id,
    organizationId: record.organizationId,
    scope: foodLibraryScopeFromPrisma[record.scope],
    name: record.name,
    category: record.category,
    servingSize: record.servingSize,
    calories: record.calories,
    proteinGrams: toNullableNumber(record.proteinGrams) ?? 0,
    carbsGrams: toNullableNumber(record.carbsGrams) ?? 0,
    fatGrams: toNullableNumber(record.fatGrams) ?? 0,
    fiberGrams: toNullableNumber(record.fiberGrams),
    metadata: record.metadataJson,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt)
  };
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}
