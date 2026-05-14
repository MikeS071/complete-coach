# M4 Forms, Check-Ins, Metrics, And External APIs Checklist

## Phase Status
- [x] M4 implementation started.
- [x] Ticket 013A schema foundation complete.
- [x] Ticket 013B form APIs complete.
- [x] Ticket 013C form builder persistence complete.
- [x] Ticket 013D submissions/check-ins/metrics complete.
- [x] Ticket 013E external read APIs complete.
- [ ] Ticket 013F exports/webhooks complete.
- [ ] Ticket 013G mandatory review gate complete.

## Schema And Migration
- [x] Prisma models exist for forms, versions, assignments, submissions, check-ins, measurements, external API keys, export jobs, webhook endpoints, and webhook deliveries.
- [x] Migration is forward-only and safe for Neon deployment.
- [x] Tenant-owned tables include `organization_id`.
- [x] Foreign keys are indexed.
- [x] Common filters have compound indexes.
- [x] Form versions are immutable after creation.
- [x] Assignments and submissions reference exact form versions.
- [x] Seed data creates realistic demo forms, assignments, submissions, check-ins, and metrics.

## Forms
- [x] `GET /api/v1/forms` returns tenant-scoped forms.
- [x] `POST /api/v1/forms` validates and creates form containers.
- [x] `GET /api/v1/forms/{form_id}` scopes by organization.
- [x] `PATCH /api/v1/forms/{form_id}` validates and updates mutable metadata only.
- [x] `POST /api/v1/forms/{form_id}/versions` creates immutable versions.
- [x] `POST /api/v1/forms/{form_id}/publish` publishes a version and sets `current_version_id`.
- [x] `POST /api/v1/forms/{form_id}/assignments` assigns a published immutable version.
- [x] Form builder can save drafts.
- [x] Form builder can publish.
- [x] Form builder can assign a published form to a client.
- [x] Fixture fallback remains only for migration-unavailable preview environments.

## Submissions And Check-Ins
- [x] Assigned form rendering uses the immutable assigned version.
- [x] Submission endpoint validates raw answers against schema.
- [x] Submission stores `answers_json` tied to the exact form version.
- [x] Submission creates or updates a check-in queue item where appropriate.
- [x] Check-in queue reads from persisted API data.
- [x] Check-in detail reads persisted submission, summary, notes, and metrics.
- [x] Review action transitions state and writes reviewer metadata.
- [x] Complete action transitions state and writes completion metadata.
- [x] Invalid state transitions return semantic errors.

## Metrics
- [x] Metric extraction supports configured `metric_key` and `metric_unit`.
- [x] Numeric metrics reject invalid numbers.
- [x] Extraction is idempotent per submission.
- [x] Extracted metrics are queryable by client, metric key, date range, and source.
- [x] `GET /api/v1/clients/{client_id}/metrics` is implemented and authorization-protected.

## External APIs
- [x] External API keys are generated once, prefixed, hashed, scoped, expirable, revocable, and organization-scoped.
- [x] External authentication checks prefix, hash, expiry, revocation, scope, optional IP allowlist, and rate limit.
- [x] External API use is audit logged without logging secrets or raw PII.
- [x] External clients endpoint is de-identified by default.
- [x] External metrics endpoints return typed metrics only.
- [x] External form submissions endpoint excludes unsafe raw answers by default.
- [x] External check-ins endpoint excludes raw health notes by default.
- [x] PII requires `external:client_pii:read`, `include_pii=true`, endpoint support, and audit log.
- [x] Cursor pagination and `limit` caps are enforced.

## Exports And Webhooks
- [x] Export jobs persist type, format, filters, status, requester API key, and timestamps.
- [ ] Export status endpoint returns queued/running/completed/failed state.
- [ ] Webhook endpoints support create/list/update/disable.
- [ ] Webhook endpoint secrets are not retrievable after creation.
- [x] Webhook payloads are signed with versioned signature headers.
- [x] Webhook delivery records persist event type, payload, status, attempts, next retry, and last error.
- [ ] Retry-ready status model is documented if background workers are deferred.

## Security
- [x] No secrets, API keys, webhook secrets, or tokens are hardcoded.
- [x] Zod validation exists at every new 013B/013D/013E route boundary.
- [x] All 013B/013D browser APIs use Auth.js session and active organization.
- [x] All external APIs use API key actor context and organization scope.
- [x] All 013B/013D Prisma queries include organization scope for tenant-owned records.
- [x] Raw health notes and free-text answers are not logged.
- [x] API key secrets and webhook secrets are never returned after creation.
- [x] Rate limiting protects external endpoints.

## Tests
- [x] Unit tests cover validation schemas.
- [x] Unit tests cover metric extraction.
- [x] Unit tests cover de-identification mappers.
- [x] Unit tests cover API key hashing and prefix generation.
- [x] Unit tests cover webhook signing.
- [x] Integration tests cover form APIs and tenant isolation.
- [x] Integration tests cover publish/version immutability.
- [x] Integration tests cover assignment/submission/check-in transitions.
- [x] Integration tests cover external APIs, scopes, PII gating, pagination, and audit logs.
- [x] Component tests cover form builder persistence.
- [x] Component tests cover check-in queue review/complete.
- [ ] E2E tests cover coach form assignment and check-in review.
- [x] `pnpm --dir apps/web check` passes for Ticket 013B.
- [x] `pnpm --dir apps/web check` passes for Ticket 013C.
- [x] `pnpm --dir apps/web check` passes for Ticket 013D.
- [x] `pnpm --dir apps/web check` passes for Ticket 013E.

## Mandatory Review Gate
Prompt: "Analyse the phase code and compare to phase specs and determine if there are any gaps. If you find any gaps, close them by implementing the relevant functionality. Each phase cannot proceed or be called complete until there are no gaps between specs and code that was actually delivered and is tested to be working. This is a mandatory requirement."

Review steps:
- [ ] Compare code against `docs/technical/forms-checkins-metrics-external-apis.md`.
- [ ] Compare code against `docs/adr/ADR-004-forms-checkins-and-external-analysis.md`.
- [ ] Compare code against `docs/api/api-contract-spec.md`.
- [ ] Compare code against `docs/architecture/data-model-spec.md`.
- [ ] Verify all checklist items above are complete or explicitly deferred outside M4 through updated roadmap docs.
- [ ] Run migrations against a clean database.
- [ ] Run seed against a clean database.
- [ ] Run API integration tests.
- [ ] Run component tests.
- [ ] Run E2E tests.
- [ ] Run `pnpm --dir apps/web check`.
- [ ] Close every gap before M4 is marked complete.
