# Training Persistence

Ticket 014 / M5 replaces fixture-only training screens with persisted exercise libraries, training templates, assignment snapshots, and scoped upload foundations.

## Current State
- `/training/exercises` now prefers persisted exercises from `GET /api/v1/exercises?limit=100` and falls back to fixtures only when the training API is unavailable.
- `/training/exercises/add` now posts new private exercises to `POST /api/v1/exercises`.
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
- Ticket 014B: program template UI persistence and assignment UI.
- Ticket 014C: R2 signed upload URL endpoint and media object metadata validation.
- Ticket 014D: client profile training tab integration.
- Ticket 014E: E2E coverage for exercise creation, template creation, and assignment.
- Ticket 014F: mandatory M5 review gate.
