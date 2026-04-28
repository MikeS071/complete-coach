# Repo Activation Technical Reference

## Purpose
Ticket 000 activates the repository foundation before product implementation begins. It creates root-level commands, workspace metadata, import-boundary checks, and pre-commit verification that can run before `apps/web` exists.

## Scope
Included:
- Root `package.json`.
- `pnpm-workspace.yaml`.
- `Makefile`.
- `.gitignore`.
- `.githooks/pre-commit`.
- `scripts/check-import-boundaries.sh`.
- `scripts/verify-repo.sh`.
- `scripts/test-repo-activation.sh`.

Excluded:
- Next.js app scaffold.
- Product UI.
- Auth.
- Database.
- External integrations.

## Commands
```bash
pnpm bootstrap
pnpm lint
pnpm typecheck
pnpm test
pnpm coverage
pnpm build
pnpm check
```

The root commands currently validate repository structure, shell scripts, planning docs, mandatory phase review gates, and import-boundary rules. Later tickets must extend these commands to include `apps/web` linting, typechecking, tests, coverage, and build.

## Import Boundaries
The boundary checker allows shared code through `pkg` and `integrations`. It blocks:
- App-to-app relative imports.
- App-to-service relative imports.
- Service-to-app imports.
- Direct `@complete-coach/apps/*` or `@complete-coach/services/*` imports.

This supports the project rule that shared code belongs in shared packages, not duplicated across apps or services.

## Pre-Commit
The pre-commit hook runs:
```bash
pnpm check
```

It intentionally does not assume a Go module or `apps/web` exists during Ticket 000. Future tickets must expand `pnpm check` rather than hardcoding app-specific assumptions into the hook.

## Verification
Ticket 000 is complete only when:
- `pnpm check` passes.
- `.githooks/pre-commit` passes.
- `scripts/test-repo-activation.sh` passes.
- The M0 mandatory review gate in `docs/roadmap/implementation-roadmap.md` has no open gaps.
