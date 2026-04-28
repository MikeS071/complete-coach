# Auth And Tenant Foundation

Ticket 011 establishes the first production persistence and authorization foundation.

## Scope
- Auth.js is installed through `next-auth@5.0.0-beta` with the Prisma adapter.
- Prisma 7 is configured for PostgreSQL/Neon with generated client output at `apps/web/app/generated/prisma`.
- The first migration creates Auth.js tables, users, organizations, organization memberships, and audit logs.
- Runtime environment parsing validates `AUTH_SECRET`, `DATABASE_URL`, optional `DIRECT_URL`, and optional `NEXTAUTH_URL`.
- Central role/capability helpers enforce the documented authorization model.
- Tenant helpers resolve active organization membership and force `organizationId` onto tenant-scoped Prisma filters.
- A seed script can create a demo organization and owner only when demo credentials are supplied through environment variables.

## Out Of Scope
- Replacing fixture-backed product pages with persisted data.
- Full route protection for the UI shell.
- OAuth provider setup.
- Team invitation email delivery.
- External API key management.
- Stripe, R2, Resend, Inngest, or Sentry runtime integration.

## Required Environment
Store real values only in local secret files, CI secrets, or Vercel environment variables.

```bash
AUTH_SECRET="generated-auth-secret-at-least-32-characters"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://USER:PASSWORD@POOLER_HOST/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@DIRECT_HOST/neondb?sslmode=require"
DEMO_COACH_EMAIL="coach@example.com"
DEMO_COACH_PASSWORD="local-only-password"
```

`DATABASE_URL` should point at the Neon pooler for runtime use. `DIRECT_URL` is preferred for migrations when available.

## Commands
Run from `apps/web` unless noted otherwise.

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm lint
pnpm typecheck
pnpm test
pnpm coverage
pnpm build
```

## Verification
- `auth-foundation.test.ts` covers environment validation, role/capability mapping, tenant access, tenant-scoped filters, and audit event construction.
- `prisma validate` verifies schema integrity without requiring a live database.
- Migration application requires a real PostgreSQL database URL and must be run against Neon or a local PostgreSQL database before M2 is called complete.

## Security Notes
- No secrets, API keys, tokens, or passwords are committed.
- Demo seed credentials must come from environment variables.
- Credentials authentication compares bcrypt password hashes only.
- Auth.js session cookies are managed by Auth.js; production requires HTTPS and `AUTH_SECRET`.
- Tenant-owned queries must use the centralized tenant helpers or service-layer equivalents before product pages move off fixtures.
