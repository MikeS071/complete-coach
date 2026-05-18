import type { InputJsonValue } from "@prisma/client/runtime/client";
import { z } from "zod";

import { PackageBillingInterval, PackageStatus } from "@/app/generated/prisma/enums";

export const packageBillingIntervalValues = ["monthly", "one-time"] as const;
export const packageStatusValues = ["active", "archived"] as const;

type ApiPackageBillingInterval = (typeof packageBillingIntervalValues)[number];
type ApiPackageStatus = (typeof packageStatusValues)[number];

const packageBillingIntervalToPrisma: Record<ApiPackageBillingInterval, PackageBillingInterval> = {
  monthly: PackageBillingInterval.MONTHLY,
  "one-time": PackageBillingInterval.ONE_TIME
};

const packageBillingIntervalFromPrisma: Record<PackageBillingInterval, ApiPackageBillingInterval> = {
  [PackageBillingInterval.MONTHLY]: "monthly",
  [PackageBillingInterval.ONE_TIME]: "one-time"
};

const packageStatusToPrisma: Record<ApiPackageStatus, PackageStatus> = {
  active: PackageStatus.ACTIVE,
  archived: PackageStatus.ARCHIVED
};

const packageStatusFromPrisma: Record<PackageStatus, ApiPackageStatus> = {
  [PackageStatus.ACTIVE]: "active",
  [PackageStatus.ARCHIVED]: "archived"
};

export const packageListQuerySchema = z.object({
  status: z.enum(packageStatusValues).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

const packageFeatureSchema = z.string().trim().min(1).max(160);

const packageInputShape = {
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2_000).optional(),
  priceAmount: z.number().int().min(0).max(10_000_000),
  currency: z.string().trim().toLowerCase().regex(/^[a-z]{3}$/),
  billingInterval: z.enum(packageBillingIntervalValues),
  features: z.array(packageFeatureSchema).max(30),
  color: z.string().trim().max(40).optional()
};

export const createPackageSchema = z
  .object({
    ...packageInputShape,
    currency: packageInputShape.currency.default("usd"),
    features: packageInputShape.features.default([])
  })
  .strict();

export const updatePackageSchema = z
  .object(packageInputShape)
  .partial()
  .extend({
    status: z.enum(packageStatusValues).optional()
  })
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field is required."
  });

export type PackageListQuery = z.infer<typeof packageListQuerySchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

interface PackageRecord {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  billingInterval: PackageBillingInterval;
  stripeProductId: string | null;
  stripePriceId: string | null;
  status: PackageStatus;
  featuresJson: unknown;
  color: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    subscriptions?: number;
  };
}

export function buildPackageWhere(organizationId: string, query: PackageListQuery) {
  return {
    organizationId,
    deletedAt: null,
    ...(query.status ? { status: packageStatusToPrisma[query.status] } : {})
  };
}

export function getPackageCreateData(organizationId: string, userId: string, input: CreatePackageInput) {
  return {
    organizationId,
    createdByUserId: userId,
    name: input.name,
    description: input.description,
    priceAmount: input.priceAmount,
    currency: input.currency,
    billingInterval: packageBillingIntervalToPrisma[input.billingInterval],
    featuresJson: input.features as InputJsonValue,
    color: input.color
  };
}

export function getPackageUpdateData(input: UpdatePackageInput) {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.priceAmount !== undefined ? { priceAmount: input.priceAmount } : {}),
    ...(input.currency !== undefined ? { currency: input.currency } : {}),
    ...(input.billingInterval !== undefined
      ? { billingInterval: packageBillingIntervalToPrisma[input.billingInterval] }
      : {}),
    ...(input.features !== undefined ? { featuresJson: input.features as InputJsonValue } : {}),
    ...(input.color !== undefined ? { color: input.color } : {}),
    ...(input.status !== undefined ? { status: packageStatusToPrisma[input.status] } : {})
  };
}

export function serializePackage(record: PackageRecord) {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    description: record.description,
    priceAmount: record.priceAmount,
    currency: record.currency,
    billingInterval: packageBillingIntervalFromPrisma[record.billingInterval],
    stripeProductId: record.stripeProductId,
    stripePriceId: record.stripePriceId,
    status: packageStatusFromPrisma[record.status],
    features: normalizeFeatures(record.featuresJson),
    color: record.color,
    activeSubscriptions: record._count?.subscriptions ?? 0,
    projectedMonthlyRevenue:
      record.billingInterval === PackageBillingInterval.MONTHLY
        ? record.priceAmount * (record._count?.subscriptions ?? 0)
        : 0,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt)
  };
}

function normalizeFeatures(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((feature): feature is string => typeof feature === "string");
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}
