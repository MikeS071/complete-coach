# Clients And CRM UI Stub

## Scope
Ticket 005 ports the client roster, client profile route, and CRM board into the Next.js UI stub.

Implemented behavior:
- `/clients` renders a fixture-backed roster with stats, search, status filters, check-in day filters, and A-Z sorting.
- `/clients/[id]` renders a decomposed fixture-backed client profile by id.
- `/clients/crm` renders a fixture-backed lead pipeline board with drag/drop and accessible stage-move controls.
- Sample client and lead data live in typed fixture modules.

## Fixture Boundary
Client fixtures live in `apps/web/fixtures/clients.ts`.

Lead fixtures live in `apps/web/fixtures/leads.ts`.

No production APIs, auth assumptions, persistence, import parsing, or export delivery behavior is implemented in this ticket. The UI preserves local interactions only so the first deliverable remains launchable with deterministic sample data.

## Verification
Coverage includes:
- Client roster render.
- Client search.
- Status and check-in day filters.
- A-Z visible roster sorting.
- Client profile lookup by id and not-found fallback.
- Client profile tab switching.
- CRM stage rendering.
- CRM lead stage movement through a keyboard/testable control.

Required commands:
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web coverage`
- `pnpm --dir apps/web build`
- `pnpm check`
