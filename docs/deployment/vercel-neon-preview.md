# Vercel Preview Deployment

## Current State
The deployed preview now includes the M1 fixture-backed UI plus the Ticket 011 Auth.js, Prisma, Neon, and tenant-foundation baseline.

Product pages still use typed fixtures while domain persistence is implemented ticket by ticket. Auth and tenant context are real foundation services backed by Neon.

## Vercel Project Settings
Use `apps/web` as the Vercel project root.

The `apps/web/vercel.json` file sets:
- Framework: Next.js
- Install command: `cd ../.. && pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `.next`

The install command intentionally runs from the monorepo root so Vercel uses the committed workspace lockfile.

## Environment Variables
Required for the deployed Auth/Neon foundation:
- `AUTH_SECRET`: generated Auth.js secret stored only in Vercel/local secret storage.
- `DATABASE_URL`: Neon pooled connection string for runtime queries.
- `DIRECT_URL`: Neon direct connection string for migrations when available.
- `NEXTAUTH_URL`: deployed app URL.

Optional:
- `DEMO_COACH_EMAIL`: demo owner seed email for local/preview smoke tests.
- `DEMO_COACH_PASSWORD`: demo owner seed password for local/preview smoke tests.

Never commit populated environment files or connection strings. Vercel environment variables must be configured through Vercel project settings.

## Local Production Build Check
Run:
```bash
pnpm install --frozen-lockfile
pnpm --dir apps/web build
```

Optional full gate:
```bash
pnpm check
```

The full gate includes Playwright and requires local browser installation:
```bash
pnpm --dir apps/web exec playwright install chromium
```

## Deployment Expectations
The deployed preview should show:
- Full app shell and sidebar navigation.
- `/sign-in` credentials sign-in surface.
- Auth.js session endpoint returning `null` for unauthenticated users and session data after valid login.
- Fixture-backed dashboard, client, training, nutrition, education, supplementation, messaging, packages, team, and social pages.
- Local-only interactive behavior such as filters, tabs, drawers, and message sending.

The deployed preview will not include:
- Persisted product-domain reads/writes beyond Auth.js, users, organizations, memberships, and audit-log baseline tables.
- Product-domain Neon reads/writes for clients, CRM, forms, training, nutrition, messages, packages, or payments.
- Stripe, Resend, R2, webhooks, or external analysis APIs.
