# Visual Parity Gate

## Purpose
This gate keeps the launchable UI stub aligned with `ui-design/Complete Coach.zip` while avoiding unapproved pixel-diff tooling.

## Source Of Truth
- Prototype archive: `ui-design/Complete Coach.zip`
- Design analysis: `docs/design-system/ui-design-analysis.md`
- Generated stylesheet: `docs/design-system/complete-coach-theme.css`
- Implementation checklist: `docs/design-system/ui-parity-checklist.md`
- Parity notes: `docs/design-system/ui-parity-notes.md`

## Automated Coverage
Playwright covers:
- Every implemented App Router page renders successfully.
- The primary sidebar navigation can move through representative sections.
- Every page exposes its expected top-level heading.
- Primary navigation is present on every page.
- Console and page runtime errors fail route smoke tests.
- Interactive controls have an accessible text, placeholder, title, or aria label.
- Keyboard focus reaches global navigation and can open/close the supplement protocol panel.

Command:
```bash
pnpm --dir apps/web e2e
```

## Manual Visual Review Checklist
For each UI route:
- Compare the page against the matching prototype component listed in `ui-design/Complete Coach.zip`.
- Confirm spacing, border radius, card hierarchy, gradient treatment, icon placement, and CTA emphasis match the exported design intent.
- Confirm sample data remains in typed fixtures rather than inline component arrays.
- Confirm any visual drift introduced for accessibility is documented in `docs/design-system/ui-parity-notes.md`.
- Confirm no page/component file exceeds 800 lines.

## Route Inventory
- `/`
- `/training`
- `/training/programs`
- `/training/exercises`
- `/training/exercises/add`
- `/nutrition`
- `/nutrition/meal-plans`
- `/nutrition/food-database`
- `/education`
- `/education/add`
- `/supplementation`
- `/supplementation/plans`
- `/supplementation/database`
- `/clients`
- `/clients/1`
- `/clients/crm`
- `/clients/check-ins`
- `/forms`
- `/messages`
- `/packages`
- `/team-management`
- `/social-media`

## Non-Goals
- Pixel-perfect automated visual regression is not included until approved.
- Real integrations, persistence, authentication, and uploads are outside the UI-stub gate.
