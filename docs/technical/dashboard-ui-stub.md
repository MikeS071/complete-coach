# Dashboard UI Stub

## Scope
Ticket 004 ports the dashboard landing route from the UI design archive into the Next.js App Router stub.

Implemented behavior:
- `/` renders the coach operations dashboard instead of the initial scaffold placeholder.
- Revenue analytics use deterministic fixture data and a local period selector.
- Client capacity, pending check-ins, client activity, and team avatar data are fixture-backed.
- Work to-do columns keep local state for completion toggles.
- The add-task slide-in creates local tasks in the selected dashboard category.

## Fixture Boundary
Dashboard sample records live in `apps/web/fixtures/dashboard.ts`.

The stub intentionally does not create API routes or persistence behavior. Local state exists only to preserve the prototype interactions before the auth, tenant, and database phases.

## Verification
Coverage includes:
- Dashboard route heading render.
- Fixture-backed metric and activity render.
- Revenue period selection.
- Work task completion toggle.
- Local task creation through the slide-in panel.

Required commands:
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web coverage`
- `pnpm --dir apps/web build`
- `pnpm check`
