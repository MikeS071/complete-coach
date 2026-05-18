# Nutrition Persistence

Ticket 015 / M6 replaces fixture-only nutrition screens with persisted food libraries, meal plan templates, assignment snapshots, and client nutrition integrations.

## Current State
- `/nutrition/food-database` now prefers persisted foods from `GET /api/v1/foods?limit=100` and falls back to fixtures only when the nutrition API is unavailable.
- `/nutrition/food-database` can create a private organization food through `POST /api/v1/foods`.
- Prisma includes `food_library_items` for global/private food library records.
- API foundations exist for food library reads and writes.

## Ticket 015A Outcome
Completed on May 18, 2026.

Delivered:
- Forward-only Prisma migration for `food_library_items`.
- Global food records are represented with `organization_id = null`; tenant private records require `organization_id`.
- Food APIs enforce active organization scope and create private tenant-owned foods only.
- Food create validation covers required serving values and macro/calorie ranges.
- Demo seed data creates one global food and one private organization food.
- Food database UI loads persisted food library data and saves new foods through the API with fixture fallback.
- API, mapper, and component tests cover food isolation, global read/private write behavior, validation, API-backed load, and UI persistence submit.

## Source Specs
- `docs/architecture/data-model-spec.md`
- `docs/api/api-contract-spec.md`
- `docs/roadmap/implementation-roadmap.md`
- `docs/roadmap/implementation-ticket-map.md`
- `docs/checklists/m6-nutrition-persistence-checklist.md`

## Data Model
- `food_library_items`: global/private library records with serving sizes, calories, macro grams, optional fiber, optional metadata, and soft-delete support.

Rules:
- Global foods have `scope = global` and no `organization_id`.
- Private foods have `scope = private` and an `organization_id`.
- Tenant users can read global foods and their organization private foods.
- Tenant users can only create private foods in their own organization.
- Meal plan assignments must snapshot template/food details when implemented in later M6 slices.

## API Surface
- `GET /api/v1/foods`
- `POST /api/v1/foods`
- `GET /api/v1/foods/{food_id}`

## Remaining M6 Work
- Ticket 015B: meal plan template and assignment persistence.
- Ticket 015C: client profile nutrition integration.
- Ticket 015D: E2E nutrition coverage.
- Ticket 015E: mandatory M6 review gate.
