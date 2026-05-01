import { describe, expect, it } from "vitest";

import {
  requireActiveActor,
  requireAuthenticatedSession,
  type AppSession
} from "@/lib/auth/session-guards";

const activeOrganization = {
  id: "org_1",
  slug: "complete-coach-demo",
  name: "Complete Coach Demo",
  role: "owner"
} as const;

const authenticatedSession: AppSession = {
  user: {
    id: "user_1",
    email: "coach@example.com",
    name: "Demo Coach"
  },
  activeOrganization,
  expires: "2099-01-01T00:00:00.000Z"
};

describe("session guards", () => {
  it("requires an authenticated user id", () => {
    expect(requireAuthenticatedSession(authenticatedSession).user.id).toBe("user_1");
    expect(() => requireAuthenticatedSession(null)).toThrow(/Unauthenticated/);
  });

  it("returns actor context for the active organization", () => {
    expect(requireActiveActor(authenticatedSession, "clients:read")).toEqual({
      userId: "user_1",
      organizationId: "org_1",
      organizationSlug: "complete-coach-demo",
      organizationName: "Complete Coach Demo",
      role: "owner"
    });
  });

  it("rejects sessions without an active organization", () => {
    expect(() =>
      requireActiveActor({
        ...authenticatedSession,
        activeOrganization: undefined
      })
    ).toThrow(/active organization/);
  });

  it("enforces capabilities on the actor role", () => {
    expect(() =>
      requireActiveActor(
        {
          ...authenticatedSession,
          activeOrganization: {
            ...activeOrganization,
            role: "assistant"
          }
        },
        "payments:manage"
      )
    ).toThrow(/Forbidden/);
  });
});
