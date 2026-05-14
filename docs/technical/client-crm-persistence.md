# Client And CRM Persistence

Ticket 012 replaces the client roster and CRM pipeline fixture-only foundation with tenant-scoped PostgreSQL persistence.

## Scope In This Slice
- Prisma schema and migration for `clients`, `client_profiles`, `leads`, and `lead_activities`.
- Authenticated `/api/v1/clients`, `/api/v1/clients/{client_id}/profile`, `/api/v1/leads`, and `/api/v1/leads/{lead_id}/activities` route handlers.
- Tenant scoping from the active Auth.js organization context. API callers cannot provide or override `organization_id`.
- Audit log writes for client/lead create, update, archive, and lead stage transitions.
- Client roster, client profile, and CRM pages attempt API-backed data first and retain fixture fallback while migrations/seeds are unavailable.
- Demo seed data populates clients and leads from the existing UI fixtures after migrations are applied.

## Security Notes
- All route handlers require an authenticated active organization.
- Read operations require `clients:read`.
- Mutations require `clients:write`.
- Prisma queries always include `organizationId` for tenant-owned records.
- Request bodies and filters are validated with Zod schemas before database access.
- Error responses use stable envelopes and do not expose raw exceptions.

## Operational Notes
Apply the migration and seed after deployment environment variables are configured:

```bash
pnpm --dir apps/web db:migrate
pnpm --dir apps/web db:seed
```

Until the migration is applied, the UI remains usable with the existing typed fixtures.

## Verification
- `pnpm --dir apps/web test client-crm-records.test.ts`
- `pnpm --dir apps/web test client-profile-page.test.tsx clients-page.test.tsx crm-page.test.tsx client-crm-api.test.ts client-crm-records.test.ts`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web check`
- `pnpm --dir apps/web db:migrate`
- `pnpm --dir apps/web db:seed`

## Production Verification
Completed on May 14, 2026 against Neon and the Vercel production alias `https://complete-coach-ten.vercel.app`.

- Vercel production deployment status: `Ready`.
- Neon migration status: up to date after applying `20260514020000_client_crm_persistence`.
- Demo seed completed successfully.
- Authenticated smoke test passed for `/`, `/clients`, `/clients/crm`, and `/clients/demo-client-1`.
- Authenticated API smoke test returned persisted data from `/api/v1/clients` and `/api/v1/leads`.
