# M4 Forms, Check-Ins, Metrics, And External APIs Checklist

## Phase Status
- [ ] M4 implementation started.
- [ ] Ticket 013A schema foundation complete.
- [ ] Ticket 013B form APIs complete.
- [ ] Ticket 013C form builder persistence complete.
- [ ] Ticket 013D submissions/check-ins/metrics complete.
- [ ] Ticket 013E external read APIs complete.
- [ ] Ticket 013F exports/webhooks complete.
- [ ] Ticket 013G mandatory review gate complete.

## Schema And Migration
- [ ] Prisma models exist for forms, versions, assignments, submissions, check-ins, measurements, external API keys, export jobs, webhook endpoints, and webhook deliveries.
- [ ] Migration is forward-only and safe for Neon deployment.
- [ ] Tenant-owned tables include `organization_id`.
- [ ] Foreign keys are indexed.
- [ ] Common filters have compound indexes.
- [ ] Form versions are immutable after creation.
- [ ] Assignments and submissions reference exact form versions.
- [ ] Seed data creates realistic demo forms, assignments, submissions, check-ins, and metrics.

## Forms
- [ ] `GET /api/v1/forms` returns tenant-scoped forms.
- [ ] `POST /api/v1/forms` validates and creates form containers.
- [ ] `GET /api/v1/forms/{form_id}` scopes by organization.
- [ ] `PATCH /api/v1/forms/{form_id}` validates and updates mutable metadata only.
- [ ] `POST /api/v1/forms/{form_id}/versions` creates immutable versions.
- [ ] `POST /api/v1/forms/{form_id}/publish` publishes a version and sets `current_version_id`.
- [ ] `POST /api/v1/forms/{form_id}/assignments` assigns a published immutable version.
- [ ] Form builder can save drafts.
- [ ] Form builder can publish.
- [ ] Form builder can assign a published form to a client.
- [ ] Fixture fallback remains only for migration-unavailable preview environments.

## Submissions And Check-Ins
- [ ] Assigned form rendering uses the immutable assigned version.
- [ ] Submission endpoint validates raw answers against schema.
- [ ] Submission stores `answers_json` tied to the exact form version.
- [ ] Submission creates or updates a check-in queue item where appropriate.
- [ ] Check-in queue reads from persisted API data.
- [ ] Check-in detail reads persisted submission, summary, notes, and metrics.
- [ ] Review action transitions state and writes reviewer metadata.
- [ ] Complete action transitions state and writes completion metadata.
- [ ] Invalid state transitions return semantic errors.

## Metrics
- [ ] Metric extraction supports configured `metric_key` and `metric_unit`.
- [ ] Numeric metrics reject invalid numbers.
- [ ] Extraction is idempotent per submission.
- [ ] Extracted metrics are queryable by client, metric key, date range, and source.
- [ ] `GET /api/v1/clients/{client_id}/metrics` is implemented and authorization-protected.

## External APIs
- [ ] External API keys are generated once, prefixed, hashed, scoped, expirable, revocable, and organization-scoped.
- [ ] External authentication checks prefix, hash, expiry, revocation, scope, optional IP allowlist, and rate limit.
- [ ] External API use is audit logged without logging secrets or raw PII.
- [ ] External clients endpoint is de-identified by default.
- [ ] External metrics endpoints return typed metrics only.
- [ ] External form submissions endpoint excludes unsafe raw answers by default.
- [ ] External check-ins endpoint excludes raw health notes by default.
- [ ] PII requires `external:client_pii:read`, `include_pii=true`, endpoint support, and audit log.
- [ ] Cursor pagination and `limit` caps are enforced.

## Exports And Webhooks
- [ ] Export jobs persist type, format, filters, status, requester API key, and timestamps.
- [ ] Export status endpoint returns queued/running/completed/failed state.
- [ ] Webhook endpoints support create/list/update/disable.
- [ ] Webhook endpoint secrets are not retrievable after creation.
- [ ] Webhook payloads are signed with versioned signature headers.
- [ ] Webhook delivery records persist event type, payload, status, attempts, next retry, and last error.
- [ ] Retry-ready status model is documented if background workers are deferred.

## Security
- [ ] No secrets, API keys, webhook secrets, or tokens are hardcoded.
- [ ] Zod validation exists at every new route boundary.
- [ ] All browser APIs use Auth.js session and active organization.
- [ ] All external APIs use API key actor context and organization scope.
- [ ] All Prisma queries include organization scope for tenant-owned records.
- [ ] Raw health notes and free-text answers are not logged.
- [ ] API key secrets and webhook secrets are never returned after creation.
- [ ] Rate limiting protects external endpoints.

## Tests
- [ ] Unit tests cover validation schemas.
- [ ] Unit tests cover metric extraction.
- [ ] Unit tests cover de-identification mappers.
- [ ] Unit tests cover API key hashing and scope checks.
- [ ] Unit tests cover webhook signing.
- [ ] Integration tests cover form APIs and tenant isolation.
- [ ] Integration tests cover publish/version immutability.
- [ ] Integration tests cover assignment/submission/check-in transitions.
- [ ] Integration tests cover external APIs, scopes, PII gating, pagination, and audit logs.
- [ ] Component tests cover form builder persistence.
- [ ] Component tests cover check-in queue review/complete.
- [ ] E2E tests cover coach form assignment and check-in review.
- [ ] `pnpm --dir apps/web check` passes.

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
