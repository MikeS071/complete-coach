# Forms And Check-Ins UI Stub

## Scope
Ticket 006 ports the forms management surface, local form builder, and check-in review center into the Next.js UI stub.

Implemented behavior:
- `/forms` renders form template cards and recent forms.
- `/forms` can switch locally into the form builder from a template or scratch flow.
- The builder supports local field add, remove, and reorder controls.
- `/clients/check-ins` renders pending and completed check-ins with local tab switching and sorting.
- Sample form and check-in records live in typed fixture modules.

## Fixture Boundary
Form fixtures live in `apps/web/fixtures/forms.ts`.

Check-in fixtures live in `apps/web/fixtures/check-ins.ts`.

No production APIs, public form submission, persistence, metric extraction, upload handling, or client portal behavior is implemented in this ticket.

## Verification
Coverage includes:
- Form management render.
- Builder open from template and scratch flows.
- Form field add, remove, and reorder behavior.
- Builder return-to-management behavior.
- Pending check-in render with timing labels.
- Completed tab switching.
- Check-in sort by name.

Required commands:
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web coverage`
- `pnpm --dir apps/web build`
- `pnpm check`
