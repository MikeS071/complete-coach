# Nutrition UI Stub

## Scope
Ticket 008 ports the nutrition overview, meal plan library, and food database into the Next.js UI stub.

Implemented behavior:
- `/nutrition` renders nutrition stats, meal-plan cards, macro bars, adherence, and recent meal logs.
- `/nutrition/meal-plans` renders active assignments and master nutrition templates with local tab switching.
- `/nutrition/food-database` renders food search, category filtering, global database CTA, ingredient cards, and local pagination controls.
- Sample foods, meal plans, templates, assignments, and logs live in typed fixtures.

## Fixture Boundary
Nutrition fixtures live in `apps/web/fixtures/nutrition.ts`.

No production APIs, persistence, global food-library sync, import parsing, or meal-plan assignment mutation is implemented in this ticket.

## Verification
Coverage includes:
- Nutrition overview render.
- Meal plan tab switching.
- Meal-plan action render.
- Food search.
- Food category filtering.
- Food pagination control state.

Required commands:
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web coverage`
- `pnpm --dir apps/web build`
- `pnpm check`
