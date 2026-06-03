# Education And Supplementation Persistence

Ticket 018 / M9 connects education resources, education assignments, supplement libraries, supplement protocol templates, and supplement assignments to durable PostgreSQL records.

## Current State
- Prisma includes `education_resources`, `education_resource_assignments`, `supplement_library_items`, `supplement_plan_templates`, and `supplement_plan_assignments`.
- Supplement library APIs can list global and active-organization private records and create active-organization private records.
- Supplement plan template APIs can list and create active-organization protocol templates with structured JSON.
- Supplement assignment APIs can assign active-organization templates to active-organization clients with immutable snapshots.
- Education resource APIs can list, create, read, and update active-organization resources.
- Education assignment API can assign active-organization resources to active-organization clients.
- Education writes require `education:write`; education assignment requires `education:assign`; read-only assistants and clients only receive `education:read`.
- Education resource uploads use R2 presigned PUT URLs and organization-scoped object ids.
- Education UI loads persisted resources with fixture fallback and creates resources from direct URLs or uploaded files.
- Supplement database UI loads persisted library items with fixture fallback and creates private supplement records.
- Supplement plan UI loads persisted active assignments and templates with fixture fallback.
- Demo seed data creates education and supplement records for the demo organization.

## Ticket 018A Outcome
Completed on June 2, 2026.

Delivered:
- Forward-only Prisma migration for education and supplementation persistence.
- Tenant-scoped `GET /api/v1/supplements` and `POST /api/v1/supplements`.
- Tenant-scoped `GET /api/v1/supplement-plan-templates` and `POST /api/v1/supplement-plan-templates`.
- Tenant-scoped `GET /api/v1/supplement-plan-assignments` and `POST /api/v1/supplement-plan-assignments`.
- Tenant-scoped `GET /api/v1/education-resources`, `POST /api/v1/education-resources`, `GET /api/v1/education-resources/{resource_id}`, and `PATCH /api/v1/education-resources/{resource_id}`.
- Tenant-scoped `POST /api/v1/education-resources/{resource_id}/assignments`.
- API tests cover supplement library isolation, supplement protocol persistence, supplement assignment snapshots, education resource persistence, education assignment scoping, and education write authorization.
- Full `pnpm --dir apps/web check` passed against a migrated and seeded disposable PostgreSQL database, including 388 Vitest tests, coverage at 91.47% statements and 80.12% branches, production build, and 61 Playwright E2E tests.

## Tickets 018B-018F Outcome
Completed on June 3, 2026.

Delivered:
- `POST /api/v1/education-resources/upload-url` creates R2 presigned upload URLs for PDF, image, and video education resources.
- Education upload validation enforces supported content types, extension/content-type matching, and per-media max byte limits.
- Education upload URL creation audits safe metadata only: content type, byte size, checksum, and inferred resource type.
- Education resource UI now loads persisted resources and falls back to fixtures when the API is unavailable.
- Add-resource UI can publish direct URL resources or upload a file through R2 before creating the education resource record.
- Supplement database UI now loads persisted supplement library items and creates private supplement records.
- Supplement plan UI now loads persisted supplement assignments and protocol templates.
- Demo seed creates education resources/assignments, global/private supplement library records, supplement templates, and supplement assignments.
- Component tests cover API-backed education and supplementation behavior.
- Playwright E2E smoke coverage covers education upload/create, education resource listing, supplement creation, and supplement plan/template rendering.
- Mandatory M9 review gate compared implementation against product scope, API contracts, data model, ADR-003 storage expectations, and the M9 checklist.
- Full `pnpm --dir apps/web check` passed against a migrated and seeded disposable PostgreSQL database, including 399 Vitest tests, coverage at 91.8% statements and 80.32% branches, production build, and 64 Playwright E2E tests.

## Source Specs
- `docs/architecture/data-model-spec.md`
- `docs/api/api-contract-spec.md`
- `docs/roadmap/implementation-roadmap.md`
- `docs/roadmap/implementation-ticket-map.md`
- `docs/checklists/m9-education-supplementation-checklist.md`
- `docs/adr/ADR-003-data-storage-and-integrations.md`

## Data Model
- `supplement_library_items`: global or organization-private supplement records with category, dosage, timing, bioavailability notes, clinical description, tags, and optional image object id.
- `supplement_plan_templates`: organization-scoped supplement protocol templates with status and structured phase/supplement JSON.
- `supplement_plan_assignments`: organization/client-scoped supplement protocol assignments with immutable template snapshots.
- `education_resources`: organization-scoped resources with title, category, type, object id or external URL, tags, visibility, and creator.
- `education_resource_assignments`: organization/client-scoped resource assignments with assigning user, status, assigned timestamp, and completion timestamp.

Rules:
- Supplement reads require `supplements:read`.
- Supplement writes require `supplements:write`.
- Supplement assignments require `supplements:assign`.
- Education reads require `education:read`.
- Education writes require `education:write`.
- Education assignments require `education:assign`.
- Supplement global records are readable by every organization but are not created through tenant APIs.
- Supplement and education assignments must verify both the client and template/resource belong to the active organization.
- Assignment APIs audit ids and safe metadata only, not full resource bodies or protocol contents.

## API Surface
- `GET /api/v1/supplements`
- `POST /api/v1/supplements`
- `GET /api/v1/supplement-plan-templates`
- `POST /api/v1/supplement-plan-templates`
- `GET /api/v1/supplement-plan-assignments`
- `POST /api/v1/supplement-plan-assignments`
- `GET /api/v1/education-resources`
- `POST /api/v1/education-resources`
- `POST /api/v1/education-resources/upload-url`
- `GET /api/v1/education-resources/{resource_id}`
- `PATCH /api/v1/education-resources/{resource_id}`
- `POST /api/v1/education-resources/{resource_id}/assignments`

## Remaining M9 Work
- None.
