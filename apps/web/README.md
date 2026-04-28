# Complete Coach Web

## Purpose
This is the Next.js App Router application for Complete Coach.

The M1 UI stub ports the prototype routes from `ui-design/Complete Coach.zip` with typed fixtures, unit coverage, and Playwright route/accessibility smoke coverage.

Ticket 011 adds the Auth.js/Prisma tenant foundation alongside the fixture-backed UI. Product routes remain fixture-backed until later persistence tickets replace each surface.

## Commands
```bash
pnpm --dir apps/web dev
pnpm --dir apps/web lint
pnpm --dir apps/web typecheck
pnpm --dir apps/web test
pnpm --dir apps/web coverage
pnpm --dir apps/web build
pnpm --dir apps/web e2e
pnpm --dir apps/web env:validate
pnpm --dir apps/web check
```

## Database And Auth Foundation
```bash
pnpm --dir apps/web db:generate
pnpm --dir apps/web db:migrate
pnpm --dir apps/web db:status
pnpm --dir apps/web db:seed
```

`db:seed` creates a demo organization and owner only when `DEMO_COACH_EMAIL` and `DEMO_COACH_PASSWORD` are supplied through environment variables.
Local Prisma commands load the repository root `.env`; deployed Vercel runtime configuration must be set in Vercel environment variables.

Install the local Chromium binary once before running E2E tests:
```bash
pnpm --dir apps/web exec playwright install chromium
```

## Styling
The scaffold imports `apps/web/styles/complete-coach-theme.css`, which references the generated design-system baseline in `docs/design-system/complete-coach-theme.css`.
