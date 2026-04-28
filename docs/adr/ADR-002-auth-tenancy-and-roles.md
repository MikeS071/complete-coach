# ADR-002: Authentication, Tenancy, And Roles

## Status
Accepted for planning

## Context
Complete Coach is a multi-tenant SaaS. The app must isolate each coaching business, support team roles, and later support a minimal client portal.

## Decision
Use NextAuth/Auth.js for authentication. Model tenants as organizations/workspaces. Users join organizations through memberships with roles: `owner`, `admin`, `coach`, `assistant`, and `client`.

## Consequences
Positive:
- Organization boundaries are explicit.
- Users can belong to more than one organization if needed later.
- Role-based authorization can be centralized and tested.
- Client portal can reuse the same auth foundation.

Negative:
- Every tenant-owned query must include organization filtering.
- Active organization context must be handled carefully.
- Role/capability mapping must be maintained as product scope grows.

Alternatives considered:
- Single-tenant platform. Rejected because the requested model is multi-tenant.
- Clerk organizations. Rejected because NextAuth was selected.
- Custom auth. Rejected because it creates unnecessary security and delivery risk.

