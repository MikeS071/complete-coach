# Training Persistence

Ticket 014 / M5 replaces fixture-only training screens with persisted exercise libraries, training templates, assignment snapshots, and scoped upload foundations.

## Current State
- `/training/exercises` now prefers persisted exercises from `GET /api/v1/exercises?limit=100` and falls back to fixtures only when the training API is unavailable.
- `/training/exercises/add` now posts new private exercises to `POST /api/v1/exercises`.
- `/training/programs` now prefers persisted templates from `GET /api/v1/training-program-templates`, assignments from `GET /api/v1/training-program-assignments`, and active clients from `GET /api/v1/clients`.
- `/training/programs` can create a draft program template and assign a persisted template to an active client.
- Exercise media uploads use `POST /api/v1/exercises/media-upload-url` to generate short-lived, organization-scoped R2 `PUT` URLs.
- Prisma includes training persistence models for global/private exercise library records, training program templates, and immutable training assignment snapshots.
- API foundations exist for exercise library reads/writes, training template reads/writes, training assignment creation/listing, and client training assignment reads.

## Ticket 014A Outcome
Completed on May 14, 2026.

Delivered:
- Forward-only Prisma migration for `exercise_library_items`, `training_program_templates`, and `training_program_assignments`.
- Enum-backed status/scope/difficulty model for training records.
- Global exercise records are represented with `organization_id = null`; tenant private records require `organization_id`.
- Exercise APIs enforce active organization scope and prevent tenant mutation of global exercises.
- Training assignment creation snapshots template details into `snapshot_json` so assignments remain stable after template edits.
- Demo seed data creates one global exercise, one private exercise, one training template, and one training assignment.
- Component UI now loads persisted exercise library data and saves new exercises through the API with fixture fallback.
- API and component tests cover training isolation, global read/private write behavior, assignment snapshots, and UI persistence paths.

## Ticket 014B Outcome
Completed on May 14, 2026.

Delivered:
- Program library UI loads persisted active assignments, templates, and active clients when APIs are available.
- Program library keeps fixture fallback when persistence APIs are unavailable, preserving the launchable UI stub behavior.
- Create New Program posts a draft template to `POST /api/v1/training-program-templates`.
- Use Template opens a client assignment dialog and posts to `POST /api/v1/training-program-assignments`.
- Successful assignment prepends the returned immutable assignment snapshot to the active programs table.
- Component tests cover API-backed template/assignment loading, template creation, and client assignment.

## Ticket 014C Outcome
Completed on May 14, 2026.

Delivered:
- `POST /api/v1/exercises/media-upload-url` validates media type, filename extension, content type, byte size, and optional SHA-256 checksum format before signing.
- Signed upload URLs are generated using Cloudflare R2's S3-compatible Signature V4 flow with a five-minute TTL.
- Generated object keys are scoped to the active organization: `organizations/{organization_id}/training/exercises/{video|image}/{uuid}.{extension}`.
- Upload URL creation writes an audit log with media type, content type, byte size, checksum metadata, and object key target.
- `POST /api/v1/exercises` and `PATCH /api/v1/exercises/{exercise_id}` reject media object keys that do not match the active organization and expected media type path.
- Storage tests cover signed URL creation, validation failure, missing R2 configuration, and cross-organization media key rejection.

Environment:
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

These variables are only required when upload URL endpoints are used. They must remain in local/Vercel secret stores and must not be committed with real values.

## Source Specs
- `docs/architecture/data-model-spec.md`
- `docs/api/api-contract-spec.md`
- `docs/roadmap/implementation-roadmap.md`
- `docs/roadmap/implementation-ticket-map.md`

## Data Model
- `exercise_library_items`: global/private library records with JSONB muscle arrays and media object keys.
- `training_program_templates`: organization-owned program templates with JSONB template content.
- `training_program_assignments`: client-specific assignments with immutable `snapshot_json`.

Rules:
- Global exercises have `scope = global` and no `organization_id`.
- Private exercises have `scope = private` and an `organization_id`.
- Tenant users can read global exercises and their organization private exercises.
- Tenant users can only mutate private exercises in their own organization.
- Assignment snapshots must not depend on future template edits.

## API Surface
- `GET /api/v1/exercises`
- `POST /api/v1/exercises`
- `GET /api/v1/exercises/{exercise_id}`
- `PATCH /api/v1/exercises/{exercise_id}`
- `GET /api/v1/training-program-templates`
- `POST /api/v1/training-program-templates`
- `GET /api/v1/training-program-assignments`
- `POST /api/v1/training-program-assignments`
- `GET /api/v1/clients/{client_id}/training-programs`

## Remaining M5 Work
- Ticket 014D: client profile training tab integration.
- Ticket 014E: E2E coverage for exercise creation, template creation, and assignment.
- Ticket 014F: mandatory M5 review gate.
