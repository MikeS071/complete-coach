# UI Scaffold Technical Reference

## Purpose
Ticket 001 creates the minimal launchable Next.js App Router foundation for the Complete Coach UI stub. It does not port the full Figma-exported UI yet.

## Scope
Included:
- `apps/web` Next.js App Router scaffold.
- TypeScript strict configuration.
- Tailwind CSS v4 PostCSS setup.
- Complete Coach theme entrypoint.
- shadcn-compatible `components.json`.
- Basic `cn` utility.
- Vitest and Testing Library setup.
- ESLint setup.
- Minimal home route.
- Web scaffold verification script.

Excluded:
- Full dashboard/app shell.
- Route inventory from the Figma design.
- Auth.
- Database.
- External services.

## Commands
```bash
pnpm --dir apps/web dev
pnpm --dir apps/web lint
pnpm --dir apps/web typecheck
pnpm --dir apps/web test
pnpm --dir apps/web coverage
pnpm --dir apps/web build
pnpm --dir apps/web check
```

Root `pnpm check` now includes `apps/web` verification when `apps/web/package.json` exists.

## Current UI
Ticket 001 originally rendered a minimal scaffold page. Tickets 003 and 004 now replace that placeholder with the reusable dashboard shell and the fixture-backed `Coach Operations Dashboard` route. Full route inventory parity with `ui-design/Complete Coach.zip` continues through Ticket 010.

## Theme
`apps/web/styles/complete-coach-theme.css` imports the generated design-system baseline from `docs/design-system/complete-coach-theme.css`. Later tickets may copy or generate this into app-local CSS if Next.js build constraints require it.
