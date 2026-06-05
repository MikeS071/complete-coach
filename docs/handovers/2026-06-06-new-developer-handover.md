# New Developer Handover - June 6, 2026

This handover is for continuing Complete Coach development on a new machine and in a new LLM session.

## Repository State
- Remote: `https://github.com/MikeS071/complete-coach`
- Branch to continue from: `feat/017f-packages-ui-revenue`
- Latest implementation commit before this handover: `213328cb1e8abae1d5284f3565a9d6024e19751c`
- Latest implementation commit message: `feat: complete education supplementation persistence`
- Working tree at handover: clean and synced with `origin/feat/017f-packages-ui-revenue`

## Completed Milestones
- M1-M9 are complete.
- Most recent completed phase: M9 Education And Supplementation.
- M9 delivered:
  - Education and supplementation persistence APIs.
  - R2-backed education resource upload URL flow.
  - API-backed education and supplementation UI with fixture fallback.
  - Demo seed data for education and supplementation records.
  - Component, API, and Playwright E2E coverage.
  - Mandatory M9 review gate.

Primary completion docs:
- `docs/checklists/m9-education-supplementation-checklist.md`
- `docs/technical/education-supplementation-persistence.md`
- `docs/roadmap/implementation-roadmap.md`
- `docs/roadmap/implementation-ticket-map.md`

## Next Work
Start with M10 / Ticket 019: Production Hardening.

Scope from the roadmap:
- Team invitations and role management.
- Sentry integration.
- Structured logging with request ids.
- Admin-facing audit/event views if prioritized.
- Rate limits.
- Security review.
- Performance review.
- Accessibility pass.
- Deployment docs.

Before implementing M10, read:
- `AGENTS.md`
- `.agents/lifecycle-policy.toml`
- `.agents/profiles/`
- `.agents/skills/`
- `.codex/rules/`
- `docs/roadmap/implementation-roadmap.md`
- `docs/roadmap/implementation-ticket-map.md`
- `docs/checklists/production-readiness-checklist.md`
- `docs/architecture/architecture-spec.md`
- `docs/architecture/data-model-spec.md`
- `docs/api/api-contract-spec.md`
- `docs/adr/ADR-003-data-storage-and-integrations.md`

## New Machine Setup
Requirements:
- Node.js 22 or newer.
- pnpm 10 or newer. The repo declares `pnpm@10.32.1`.
- Docker, if running clean PostgreSQL verification locally.
- Playwright Chromium installed locally for E2E tests.

Clone and install:
```bash
git clone https://github.com/MikeS071/complete-coach.git
cd complete-coach
git checkout feat/017f-packages-ui-revenue
pnpm install --frozen-lockfile
pnpm --dir apps/web exec playwright install chromium
```

Create local environment from the template:
```bash
cp .env.example .env
```

Populate `.env` with local-only values. Never commit real values.

Minimum local app values:
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `DATABASE_URL`
- `DIRECT_URL`
- Optional `DEMO_COACH_EMAIL`
- Optional `DEMO_COACH_PASSWORD`

Optional integration values:
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Validate environment:
```bash
pnpm --dir apps/web env:validate
```

Run migrations and seed:
```bash
pnpm --dir apps/web db:migrate
pnpm --dir apps/web db:seed
```

Run the app:
```bash
pnpm --dir apps/web dev
```

Open `http://localhost:3000`.

## Clean Verification Pattern
Use a disposable database before calling a phase complete:
```bash
docker rm -f complete-coach-review-db >/dev/null 2>&1 || true
docker run --rm --name complete-coach-review-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=complete_coach \
  -p 55434:5432 \
  -d postgres:16-alpine
```

Wait for readiness:
```bash
until docker exec complete-coach-review-db pg_isready -U postgres -d complete_coach >/dev/null 2>&1; do sleep 1; done
```

Run migration, seed, and full app gate:
```bash
DATABASE_URL='postgresql://postgres:postgres@localhost:55434/complete_coach' \
DIRECT_URL='postgresql://postgres:postgres@localhost:55434/complete_coach' \
DEMO_COACH_EMAIL='demo-owner@example.test' \
DEMO_COACH_PASSWORD='Password123!' \
pnpm --dir apps/web db:migrate

DATABASE_URL='postgresql://postgres:postgres@localhost:55434/complete_coach' \
DIRECT_URL='postgresql://postgres:postgres@localhost:55434/complete_coach' \
DEMO_COACH_EMAIL='demo-owner@example.test' \
DEMO_COACH_PASSWORD='Password123!' \
pnpm --dir apps/web db:seed

DATABASE_URL='postgresql://postgres:postgres@localhost:55434/complete_coach' \
DIRECT_URL='postgresql://postgres:postgres@localhost:55434/complete_coach' \
DEMO_COACH_EMAIL='demo-owner@example.test' \
DEMO_COACH_PASSWORD='Password123!' \
PLAYWRIGHT_PORT=3110 \
AUTH_URL='http://localhost:3110' \
NEXTAUTH_URL='http://localhost:3110' \
pnpm --dir apps/web check
```

At this handover, the last successful full gate was:
- 399 Vitest tests.
- 91.8% statement coverage.
- 80.32% branch coverage.
- Production build passed.
- 64 Playwright tests passed.

Clean up:
```bash
docker rm -f complete-coach-review-db
```

## Vercel Deployment Continuity
Vercel project root must be `apps/web`.

`apps/web/vercel.json` currently sets:
- Framework: Next.js.
- Install command: `cd ../.. && pnpm install --frozen-lockfile`.
- Build command: `pnpm build`.
- Output directory: `.next`.

Required Vercel environment variables:
- `AUTH_SECRET`
- `DATABASE_URL`
- `DIRECT_URL` when available
- `NEXTAUTH_URL`

Optional Vercel environment variables:
- `DEMO_COACH_EMAIL`
- `DEMO_COACH_PASSWORD`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Deployment checklist:
- Confirm the target branch in Vercel is correct.
- Confirm Vercel environment variables are set for the target environment.
- Run Neon migrations before or during deployment using the direct connection string.
- Run `pnpm --dir apps/web build` locally before deployment.
- Smoke test `/sign-in`, authenticated dashboard, `/packages`, `/education`, `/education/add`, `/supplementation/database`, and `/supplementation/plans`.
- Confirm upload URL endpoints return `503 storage_unconfigured` when R2 is intentionally absent, or valid presigned URLs when R2 is configured.
- Keep rollback simple: promote the previous Vercel deployment if deployment smoke fails.

Detailed deployment notes:
- `docs/deployment/vercel-neon-preview.md`

## Important Development Rules
- Keep files under the repo's 800-line cap where possible.
- Do not revert user changes unless explicitly asked.
- Update docs when interfaces change.
- Add tests for new behavior.
- Keep implementation and docs aligned in the same change.
- Treat API contracts, schema docs, and roadmap/checklists as first-class deliverables.
- Use PostgreSQL as durable source of truth unless otherwise specified.
- Preserve clean import boundaries.
- Do not commit `.env` or real secrets.

## Known Build Quirk
`next build` may rewrite `apps/web/next-env.d.ts` from:
```ts
import "./.next/types/routes.d.ts";
```
to:
```ts
import "./.next/dev/types/routes.d.ts";
```

Restore it to `./.next/types/routes.d.ts` before committing if it changes.

## Prompt For A New LLM Session
Paste this into the next LLM session after cloning the repo:

```text
You are continuing development on Complete Coach.

Repository: https://github.com/MikeS071/complete-coach
Branch: feat/017f-packages-ui-revenue
Start from commit: 213328cb1e8abae1d5284f3565a9d6024e19751c

Read AGENTS.md, .agents/lifecycle-policy.toml, .agents/profiles/, .agents/skills/, .codex/rules/, docs/handovers/2026-06-06-new-developer-handover.md, docs/roadmap/implementation-roadmap.md, docs/roadmap/implementation-ticket-map.md, docs/checklists/production-readiness-checklist.md, docs/api/api-contract-spec.md, docs/architecture/data-model-spec.md, and docs/deployment/vercel-neon-preview.md before coding.

M1-M9 are complete. The latest completed phase is M9 Education And Supplementation. The next planned work is M10 / Ticket 019 Production Hardening: team invitations/role management, Sentry, structured logging with request ids, audit/event views if prioritized, rate limits, security review, performance review, accessibility pass, and deployment docs.

Follow repo rules:
- Stay in scope.
- Use TDD for new behavior.
- Update docs/contracts/checklists when interfaces change.
- Keep implementation and docs aligned.
- Preserve clean import boundaries.
- Do not commit secrets.
- Run the full verification gate before calling a phase complete.

Before starting implementation, inspect git status, confirm the branch is synced, and summarize the current state and intended M10 plan.
```
