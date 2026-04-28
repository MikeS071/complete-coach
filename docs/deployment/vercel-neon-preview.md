# Vercel Preview Deployment

## Current State
The M1 UI stub can be deployed to Vercel now as a fixture-backed preview.

Neon is not required for this preview because persistence, Prisma, Auth.js, and tenant-aware data access start in Ticket 011.

## Vercel Project Settings
Use `apps/web` as the Vercel project root.

The `apps/web/vercel.json` file sets:
- Framework: Next.js
- Install command: `cd ../.. && pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `.next`

The install command intentionally runs from the monorepo root so Vercel uses the committed workspace lockfile.

## Environment Variables
No environment variables are required for the M1 UI preview.

Do not add Neon credentials until Ticket 011 introduces Prisma and environment validation.

Future variables:
- `DATABASE_URL`: Neon pooled connection string.
- `DIRECT_URL`: Neon direct connection string for migrations.
- `NEXTAUTH_URL`: deployed app URL.
- `NEXTAUTH_SECRET`: generated secret stored only in Vercel/local secret storage.

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
- Fixture-backed dashboard, client, training, nutrition, education, supplementation, messaging, packages, team, and social pages.
- Local-only interactive behavior such as filters, tabs, drawers, and message sending.

The deployed preview will not include:
- Authentication.
- Database persistence.
- Neon reads/writes.
- Stripe, Resend, R2, webhooks, or external analysis APIs.
