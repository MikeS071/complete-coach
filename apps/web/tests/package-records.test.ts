import { describe, expect, it } from "vitest";

import { PackageBillingInterval, PackageStatus } from "@/app/generated/prisma/enums";
import {
  buildPackageWhere,
  createPackageSchema,
  getPackageCreateData,
  getPackageUpdateData,
  packageListQuerySchema,
  serializePackage,
  updatePackageSchema
} from "@/lib/payments/package-records";

const now = new Date("2026-05-18T00:00:00.000Z");

const basePackageRecord = {
  id: "package_1",
  organizationId: "org_1",
  name: "12-Week Transform",
  description: null,
  priceAmount: 149900,
  currency: "usd",
  billingInterval: PackageBillingInterval.ONE_TIME,
  stripeProductId: "prod_123",
  stripePriceId: "price_123",
  status: PackageStatus.ACTIVE,
  featuresJson: null,
  color: null,
  createdAt: now,
  updatedAt: now
};

describe("package record helpers", () => {
  it("builds package filters with and without status", () => {
    expect(buildPackageWhere("org_1", packageListQuerySchema.parse({}))).toEqual({
      organizationId: "org_1",
      deletedAt: null
    });
    expect(buildPackageWhere("org_1", packageListQuerySchema.parse({ status: "archived" }))).toEqual({
      organizationId: "org_1",
      deletedAt: null,
      status: PackageStatus.ARCHIVED
    });
  });

  it("applies create defaults and maps API enums to Prisma values", () => {
    const input = createPackageSchema.parse({
      name: "Gold Standard",
      priceAmount: 39900,
      billingInterval: "monthly"
    });

    expect(getPackageCreateData("org_1", "user_1", input)).toEqual({
      organizationId: "org_1",
      createdByUserId: "user_1",
      name: "Gold Standard",
      description: undefined,
      priceAmount: 39900,
      currency: "usd",
      billingInterval: PackageBillingInterval.MONTHLY,
      featuresJson: [],
      color: undefined
    });
  });

  it("builds partial update data without adding omitted defaults", () => {
    const input = updatePackageSchema.parse({
      description: "Updated package",
      billingInterval: "one-time",
      features: ["Video review"],
      color: "indigo",
      status: "archived"
    });

    expect(getPackageUpdateData(input)).toEqual({
      description: "Updated package",
      billingInterval: PackageBillingInterval.ONE_TIME,
      featuresJson: ["Video review"],
      color: "indigo",
      status: PackageStatus.ARCHIVED
    });
  });

  it("serializes one-time packages without monthly revenue and normalizes invalid feature metadata", () => {
    expect(serializePackage(basePackageRecord)).toEqual(
      expect.objectContaining({
        billingInterval: "one-time",
        features: [],
        activeSubscriptions: 0,
        projectedMonthlyRevenue: 0,
        createdAt: "2026-05-18T00:00:00.000Z"
      })
    );
  });

  it("serializes monthly packages with string timestamps and filtered features", () => {
    expect(
      serializePackage({
        ...basePackageRecord,
        billingInterval: PackageBillingInterval.MONTHLY,
        featuresJson: ["Check-ins", 123, "Messaging"],
        createdAt: "2026-05-18T01:00:00.000Z",
        updatedAt: "2026-05-18T02:00:00.000Z",
        _count: { subscriptions: 2 }
      })
    ).toEqual(
      expect.objectContaining({
        billingInterval: "monthly",
        features: ["Check-ins", "Messaging"],
        activeSubscriptions: 2,
        projectedMonthlyRevenue: 299800,
        createdAt: "2026-05-18T01:00:00.000Z",
        updatedAt: "2026-05-18T02:00:00.000Z"
      })
    );
  });
});
