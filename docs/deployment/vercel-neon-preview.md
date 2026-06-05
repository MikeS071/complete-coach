# Vercel Preview Deployment

## Current State
The deployed preview target now includes the M1-M9 implementation baseline.

Auth, tenancy, clients/CRM, forms/check-ins, training, nutrition, operations messaging/tasks/notifications, payments/packages, education, and supplementation persistence are implemented ticket by ticket and backed by PostgreSQL/Neon. Some UI surfaces still keep fixture fallback behavior when APIs are unavailable.

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
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`: required for R2-backed upload URL endpoints.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: required for live Stripe package/payment flows.

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
- Full app shell and sidebar navigation after a valid login.
- `/sign-in` credentials sign-in surface.
- No sidebar/topbar app chrome on signed-out public screens.
- Auth.js session endpoint returning `null` for unauthenticated users and session data after valid login.
- API-backed clients/CRM, forms/check-ins, training, nutrition, operations messaging/tasks/notifications, packages/payments, education, and supplementation flows where persistence tickets are complete.
- Fixture-backed fallback behavior where implemented for user-facing resilience.
- Local interactive behavior such as filters, tabs, drawers, and message sending.

The deployed preview will not include:
- Full social integrations.
- User-facing AI automation.
- Production hardening items from M10 until Ticket 019 is complete.
