# UI Stub E2E And Visual Gate

## Scope
Ticket 010 adds the final M1 gate for route navigation, accessibility smoke, visual parity tracking, and file-size enforcement.

Implemented behavior:
- Playwright runs Chromium route smoke tests for every UI-stub route.
- Playwright verifies representative sidebar navigation.
- Playwright accessibility smoke checks every route for named interactive controls and expected heading structure.
- Playwright keyboard smoke checks focus into global navigation and supplement protocol panel controls.
- CI installs the Chromium browser before repository verification.
- Repository lint verification enforces the 800-line file cap for `apps/web`, `docs`, `scripts`, and `.github`.

## Commands
- `pnpm --dir apps/web e2e`
- `bash scripts/check-file-size.sh`
- `pnpm check`

## Browser Setup
Local machines need the Playwright Chromium binary once:
```bash
pnpm --dir apps/web exec playwright install chromium
```

CI installs Chromium with system dependencies:
```bash
pnpm --dir apps/web exec playwright install --with-deps chromium
```

## Gate Coverage
The gate validates:
- All App Router pages render with their expected `h1`.
- Primary navigation is visible on every page.
- Runtime console/page errors fail navigation smoke.
- Representative sidebar links navigate correctly.
- Inputs, links, buttons, textareas, and selects have accessible names.
- Keyboard focus can reach global navigation and operate the supplement slide-in panel.
- No scoped product/docs/CI file exceeds 800 lines.

## Known Limits
This is a smoke and parity gate. It does not include pixel-diff snapshots, cross-browser matrix testing, or real production workflows.
