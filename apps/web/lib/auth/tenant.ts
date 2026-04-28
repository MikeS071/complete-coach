import {
  assertCapability,
  type Capability,
  type MembershipRole
} from "@/lib/auth/permissions";

export type MembershipStatus = "invited" | "active" | "suspended" | "removed";

export interface MembershipSummary {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  role: MembershipRole;
  status: MembershipStatus;
}

export interface ActorContext {
  userId: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  role: MembershipRole;
}

export class TenantAccessError extends Error {
  constructor(organizationId?: string) {
    super(
      organizationId
        ? `No active organization membership for ${organizationId}`
        : "No active organization membership"
    );
    this.name = "TenantAccessError";
  }
}

export function resolveActiveOrganization(
  memberships: readonly MembershipSummary[],
  requestedOrganizationId?: string
) {
  const membership = memberships.find(
    (candidate) =>
      candidate.status === "active" &&
      (requestedOrganizationId ? candidate.organizationId === requestedOrganizationId : true)
  );

  if (!membership) {
    throw new TenantAccessError(requestedOrganizationId);
  }

  return membership;
}

export function assertOrganizationAccess(
  memberships: readonly MembershipSummary[],
  organizationId: string,
  capability: Capability
) {
  const membership = resolveActiveOrganization(memberships, organizationId);
  assertCapability(membership.role, capability);

  return membership;
}

export function scopeTenantWhere<TWhere extends Record<string, unknown>>(
  organizationId: string,
  where?: TWhere
) {
  return {
    ...where,
    organizationId
  };
}
