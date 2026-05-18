import { describe, expect, it } from "vitest";

import { ClientSubscriptionStatus } from "@/app/generated/prisma/enums";
import {
  buildClientSubscriptionWhere,
  clientSubscriptionListQuerySchema,
  serializeClientSubscription
} from "@/lib/payments/subscription-records";

const now = new Date("2026-05-18T00:00:00.000Z");

describe("client subscription record helpers", () => {
  it("builds subscription filters with and without optional query fields", () => {
    expect(buildClientSubscriptionWhere("org_1", clientSubscriptionListQuerySchema.parse({}))).toEqual({
      organizationId: "org_1"
    });
    expect(
      buildClientSubscriptionWhere(
        "org_1",
        clientSubscriptionListQuerySchema.parse({ clientId: "client_1", status: "active" })
      )
    ).toEqual({
      organizationId: "org_1",
      clientId: "client_1",
      status: ClientSubscriptionStatus.ACTIVE
    });
  });

  it.each([
    [ClientSubscriptionStatus.INCOMPLETE, "incomplete"],
    [ClientSubscriptionStatus.INCOMPLETE_EXPIRED, "incomplete-expired"],
    [ClientSubscriptionStatus.TRIALING, "trialing"],
    [ClientSubscriptionStatus.ACTIVE, "active"],
    [ClientSubscriptionStatus.PAST_DUE, "past-due"],
    [ClientSubscriptionStatus.CANCELED, "canceled"],
    [ClientSubscriptionStatus.UNPAID, "unpaid"],
    [ClientSubscriptionStatus.PAUSED, "paused"]
  ] as const)("serializes status %s", (status, expected) => {
    expect(
      serializeClientSubscription({
        id: "subscription_1",
        organizationId: "org_1",
        clientId: "client_1",
        packageId: "package_1",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripeCheckoutSessionId: null,
        status,
        currentPeriodStart: now,
        currentPeriodEnd: "2026-06-18T00:00:00.000Z",
        cancelAt: null,
        createdAt: now,
        updatedAt: "2026-05-18T01:00:00.000Z"
      })
    ).toEqual(
      expect.objectContaining({
        status: expected,
        currentPeriodStart: "2026-05-18T00:00:00.000Z",
        currentPeriodEnd: "2026-06-18T00:00:00.000Z",
        cancelAt: null,
        client: null,
        package: null,
        createdAt: "2026-05-18T00:00:00.000Z",
        updatedAt: "2026-05-18T01:00:00.000Z"
      })
    );
  });
});
