# Nutrition Persistence

Ticket 015 / M6 replaces fixture-only nutrition screens with persisted food libraries, meal plan templates, assignment snapshots, and client nutrition integrations.

## Current State
- `/nutrition/food-database` now prefers persisted foods from `GET /api/v1/foods?limit=100` and falls back to fixtures only when the nutrition API is unavailable.
- `/nutrition/food-database` can create a private organization food through `POST /api/v1/foods`.
- `/nutrition/meal-plans` now prefers persisted meal plan templates, meal plan assignments, and active clients from the API with fixture fallback.
- `/nutrition/meal-plans` can create persisted meal plan templates and assign templates to active clients.
- Prisma includes `food_library_items`, `meal_plan_templates`, and `meal_plan_assignments`.
- API foundations exist for food library reads/writes, meal template reads/writes, organization assignment reads/writes, and client-scoped meal plan reads.

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

## Ticket 015B Outcome
Completed on May 18, 2026.

Delivered:
- Forward-only Prisma migration for meal plan template and assignment status enums, `meal_plan_templates`, and `meal_plan_assignments`.
- Meal templates persist macro targets, phase, status, and structured `template_json`.
- Meal assignments copy macro targets from the selected template and store an immutable `snapshot_json` with template/food details.
- Demo seed data creates a published meal template and an active meal plan assignment for the demo client.
- Meal plan APIs enforce active organization scope and verify client/template ownership before assignment.
- Meal plan UI loads persisted templates and assignments, can create a template, can assign a template to an active client, and retains fixture fallback.
- API, mapper, and component tests cover template creation/listing, assignment snapshot creation, scoped client meal plan reads, and UI persistence flows.

## Source Specs
- `docs/architecture/data-model-spec.md`
- `docs/api/api-contract-spec.md`
- `docs/roadmap/implementation-roadmap.md`
- `docs/roadmap/implementation-ticket-map.md`
- `docs/checklists/m6-nutrition-persistence-checklist.md`

## Data Model
- `food_library_items`: global/private library records with serving sizes, calories, macro grams, optional fiber, optional metadata, and soft-delete support.
- `meal_plan_templates`: organization-owned template records with phase, target calories, macro grams, status, structured `template_json`, creator, timestamps, and soft-delete support.
- `meal_plan_assignments`: organization/client-scoped assignment records with copied template targets, status, start/end dates, immutable `snapshot_json`, creator, and timestamps.

Rules:
- Global foods have `scope = global` and no `organization_id`.
- Private foods have `scope = private` and an `organization_id`.
- Tenant users can read global foods and their organization private foods.
- Tenant users can only create private foods in their own organization.
- Meal plan assignments snapshot template/food details at assignment time and do not depend on subsequent template edits.

## API Surface
- `GET /api/v1/foods`
- `POST /api/v1/foods`
- `GET /api/v1/foods/{food_id}`
- `GET /api/v1/meal-plan-templates`
- `POST /api/v1/meal-plan-templates`
- `GET /api/v1/meal-plan-assignments`
- `POST /api/v1/meal-plan-assignments`
- `GET /api/v1/clients/{client_id}/meal-plans`

## Remaining M6 Work
- Ticket 015C: client profile nutrition integration.
- Ticket 015D: E2E nutrition coverage.
- Ticket 015E: mandatory M6 review gate.
