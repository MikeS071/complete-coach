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
- The app shell is wrapped in a client `SessionProvider`; the user menu reflects authenticated user and active organization state.
- `/sign-in` provides the first credentials sign-in surface while product pages remain fixture-backed during the persistence rollout.
- Session guard helpers centralize authenticated-session and active-organization requirements for upcoming route handlers and server actions.

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

For local Playwright runs, `apps/web/playwright.config.ts` pins `AUTH_URL` and `NEXTAUTH_URL` to the Playwright `baseURL` so Auth.js callbacks, browser URLs, and cookie domains stay aligned even when the developer `.env` contains the deployed Vercel URL.

## Commands
Run from `apps/web` unless noted otherwise.

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:status
pnpm db:seed
pnpm env:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm coverage
pnpm build
pnpm e2e
```

Local Prisma commands load the repository root `.env`. Vercel deployments do not read local `.env` files, so `AUTH_SECRET`, `DATABASE_URL`, `DIRECT_URL`, and `NEXTAUTH_URL` must also be configured in the Vercel project settings.

## Verification
- `auth-foundation.test.ts` covers environment validation, role/capability mapping, tenant access, tenant-scoped filters, and audit event construction.
- `auth-ui.test.tsx` covers unauthenticated and authenticated user-menu states, sign-out callback behavior, and credentials sign-in submission.
- `session-guards.test.ts` covers missing session, missing active organization, and capability-denied cases.
- `auth.spec.ts` covers the `/sign-in` surface and seeded demo-owner browser login when demo credentials are available.
- `prisma validate` verifies schema integrity without requiring a live database.
- Migration application requires a real PostgreSQL database URL and must be run against Neon or a local PostgreSQL database before M2 is called complete.
- The initial Neon migration was applied successfully on 2026-04-28 with `pnpm --dir apps/web db:migrate`.
- The deployed unauthenticated session endpoint was verified on 2026-04-28 with `/api/auth/session` returning HTTP 200 and `null`.

## Ticket 011 Review Gate
Prompt: "Analyse the phase code and compare to phase specs and determine if there are any gaps. If you find any gaps, close them by implementing the relevant functionality. Each phase cannot proceed or be called complete until there are no gaps between specs and code that was actually delivered and is tested to be working. This is a mandatory requirement."

Result: no open Ticket 011 gaps after the 2026-05-01 review.

Reviewed against:
- `docs/architecture/architecture-spec.md`
- `docs/architecture/data-model-spec.md`
- `docs/adr/ADR-001-application-foundation.md`
- `docs/adr/ADR-002-auth-tenancy-and-roles.md`
- `docs/roadmap/implementation-roadmap.md`
- `docs/roadmap/implementation-ticket-map.md`

Verified complete:
- Auth.js is configured with environment-only `AUTH_SECRET`, Prisma adapter, credentials provider, JWT sessions, and `trustHost`.
- Prisma/Neon schema includes Auth.js tables, organizations, organization memberships, role enum, membership status enum, and audit logs.
- Role/capability helpers, tenant helpers, and session guard helpers exist with tests.
- Demo seed creates a Neon-backed organization owner only from environment-provided credentials.
- `/sign-in` is launchable and browser-tested with seeded credentials.
- Local E2E Auth.js callback URLs are pinned to the Playwright base URL to avoid production URL leakage during local tests.
- Product-domain pages remain fixture-backed by scope and are not marked persisted.

Verification commands:
- `pnpm --dir apps/web env:validate`
- `pnpm --dir apps/web exec prisma validate`
- `pnpm --dir apps/web db:status`
- `pnpm --dir apps/web check`
- `pnpm check`

## Security Notes
- No secrets, API keys, tokens, or passwords are committed.
- Demo seed credentials must come from environment variables.
- Credentials authentication compares bcrypt password hashes only.
- Auth.js session cookies are managed by Auth.js; production requires HTTPS and `AUTH_SECRET`.
- Tenant-owned queries must use the centralized tenant helpers or service-layer equivalents before product pages move off fixtures.
- E2E auth smoke tests must not print demo passwords or full connection strings.
