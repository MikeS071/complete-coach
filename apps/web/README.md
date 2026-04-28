# Complete Coach Web

## Purpose
This is the Next.js App Router application for Complete Coach.

The M1 UI stub ports the prototype routes from `ui-design/Complete Coach.zip` with typed fixtures, unit coverage, and Playwright route/accessibility smoke coverage.

## Commands
```bash
pnpm --dir apps/web dev
pnpm --dir apps/web lint
pnpm --dir apps/web typecheck
pnpm --dir apps/web test
pnpm --dir apps/web coverage
pnpm --dir apps/web build
pnpm --dir apps/web e2e
pnpm --dir apps/web check
```

Install the local Chromium binary once before running E2E tests:
```bash
pnpm --dir apps/web exec playwright install chromium
```

## Styling
The scaffold imports `apps/web/styles/complete-coach-theme.css`, which references the generated design-system baseline in `docs/design-system/complete-coach-theme.css`.
