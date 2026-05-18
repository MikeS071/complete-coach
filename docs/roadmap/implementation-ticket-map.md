# Implementation Ticket Map

## Purpose
This is the executable planning bridge between the roadmap and implementation. Each ticket should become one focused branch/PR. Downstream code agents must not combine unrelated tickets.

## Ticket 000 - Repo Activation
Status: Complete.

Scope:
- Add package/workspace foundation.
- Add root commands for bootstrap, lint, typecheck, test, coverage, build.
- Fix pre-commit assumptions so it only references existing commands.
- Add import-boundary script.

Depends on:
- Planning docs accepted.

Tests:
- Shell script syntax checks.
- Command smoke checks.

Out of scope:
- Product UI.
- Database schema.

## Ticket 001 - Next.js UI Stub Scaffold
Status: Complete.

Scope:
- Create `apps/web` Next.js App Router app.
- Configure TypeScript, Tailwind, shadcn-compatible setup, test tooling.
- Add root workspace scripts.
- Install generated theme baseline.
- Render a minimal dashboard shell placeholder.

Depends on:
- Ticket 000.

Tests:
- App build smoke.
- Initial route renders.

Out of scope:
- Full UI port.
- Auth.
- Database.

## Ticket 002 - Design System And UI Primitives
Status: Complete.

Scope:
- Port/regenerate shadcn/Radix primitives needed by the exported UI.
- Add `cn` helper and design tokens.
- Add typography/font decision.
- Document parity notes.

Depends on:
- Ticket 001.

Tests:
- Component primitive smoke tests.
- Accessibility smoke for button/input/dialog primitives.

Out of scope:
- Page-level UI.

## Ticket 003 - App Shell And Navigation
Status: Complete.

Scope:
- Implement sidebar/topbar shell.
- Implement nested navigation groups for training, nutrition, supplementation, clients.
- Implement notification dropdown with fixture data.
- Implement active route state.

Depends on:
- Ticket 002.

Tests:
- Navigation renders.
- Active route state works.
- Notification mark-read behavior works locally.

Out of scope:
- Backend notifications.

## Ticket 004 - Dashboard UI Stub
Status: Complete.

Scope:
- Port dashboard page.
- Move dashboard tasks, pipeline events, financial cards, team avatars to fixtures.
- Implement local period selector and task creation behavior.

Depends on:
- Ticket 003.

Tests:
- Dashboard route renders.
- Period selector updates label.
- Task creation adds local fixture-state task.

Out of scope:
- Real revenue/tasks/pipeline APIs.

## Ticket 005 - Clients And CRM UI Stub
Status: Complete.

Scope:
- Port clients roster.
- Port client profile route with decomposition.
- Port CRM board.
- Move clients/leads/profile data to fixtures.

Depends on:
- Ticket 003.

Tests:
- Client search/filter/sort.
- Client profile route renders by id.
- CRM stage drag/drop or equivalent testable transition.

Out of scope:
- Persistence.
- Auth.

## Ticket 006 - Forms And Check-Ins UI Stub
Status: Complete.

Scope:
- Port forms management.
- Port form builder.
- Port check-in management.
- Move form/check-in data to fixtures.

Depends on:
- Ticket 003.

Tests:
- Create form path opens builder.
- Add/remove/reorder form fields.
- Check-in tabs/sorting work.

Out of scope:
- Public form submission.
- Metric extraction.

## Ticket 007 - Training UI Stub
Status: Complete.

Scope:
- Port training overview.
- Port training programs.
- Port exercise database.
- Port add exercise.
- Move exercises/programs to fixtures.

Depends on:
- Ticket 003.

Tests:
- Exercise search/filter.
- Add exercise form local interactions.
- Program tabs render.

Out of scope:
- R2 upload.
- Persisted exercise library.

## Ticket 008 - Nutrition UI Stub
Status: Complete.

Scope:
- Port nutrition overview.
- Port meal plans.
- Port food database.
- Move foods/meal plans to fixtures.

Depends on:
- Ticket 003.

Tests:
- Food search/filter/page interactions.
- Meal plan tab/actions render.

Out of scope:
- Persisted meal plans.

## Ticket 009 - Education, Supplementation, Packages, Messages, Team, Social UI Stub
Status: Complete.

Scope:
- Port remaining prototype pages.
- Move all remaining sample data to fixtures.
- Ensure all listed routes render.

Depends on:
- Ticket 003.

Tests:
- Route smoke for every page.
- Message conversation selection and local send.
- Supplement new protocol panel.

Out of scope:
- Real integrations.

## Ticket 010 - UI Stub E2E And Visual Parity Gate
Status: Complete.

Scope:
- Add Playwright navigation smoke.
- Add visual parity checklist document.
- Add accessibility smoke coverage.
- Ensure no file exceeds 800 lines.

Depends on:
- Tickets 004 through 009.

Tests:
- Playwright route navigation.
- Accessibility checks.
- Build/lint/typecheck.

Out of scope:
- Pixel-perfect automated visual regression unless tooling is explicitly approved.

## Ticket 011 - Auth And Tenant Foundation
Status: Complete.

Scope:
- Add NextAuth/Auth.js.
- Add Prisma and Neon env validation.
- Implement organizations, users, memberships, role/capability helpers.
- Add initial migrations and tests.

Depends on:
- UI stub accepted.

Tests:
- Auth/session helper tests.
- Authorization unit tests.
- Tenant isolation integration tests.
- Auth UI unit tests.
- Playwright sign-in smoke with seeded demo owner credentials when demo credentials are available.

Out of scope:
- Replacing every fixture-backed page.

## Ticket 012 - Client And CRM Persistence
Status: Complete. Merged to `main`, deployed to Vercel, migrated on Neon, seeded, and smoke-tested against the production alias.

Scope:
- Implement clients, client profiles, leads, lead activities APIs.
- Replace clients/CRM fixtures with API-backed data.
- Add audit logging for sensitive reads/writes.

Depends on:
- Ticket 011.

Tests:
- API integration tests.
- E2E clients/CRM flows.
- Cross-tenant access denied tests.

Out of scope:
- Forms/check-ins.

## Ticket 012B - Client And CRM Mutation UI
Status: Complete. Persisted roster and CRM mutation UI is implemented and covered by component and E2E tests.

Scope:
- Add persisted client create, edit, and archive actions to the roster UI.
- Add persisted lead create and edit actions to the CRM board.
- Keep lead stage transitions persisted and reconcile UI state from API responses.
- Add CRM search over persisted lead cards.

Depends on:
- Ticket 012.

Tests:
- Component tests for client create, edit, archive flows.
- Component tests for lead create, edit, search, and stage movement flows.
- API tests for client and lead PATCH fields used by the UI.

Out of scope:
- Rich client profile editing.
- Forms/check-ins.

## Ticket 013 - Forms, Check-Ins, Metrics, External APIs
Status: Complete. Deployment for M3 commit `e2a38e6` is verified; Tickets 013A through 013G are complete and M4 is ready for deployment verification.

Scope:
- Implement form versioning/submissions/check-ins.
- Implement metric extraction.
- Implement external analysis APIs.
- Implement API keys/webhooks.

Depends on:
- Ticket 012.

Tests:
- Form version immutability.
- Metric extraction.
- External API de-identification.
- PII scope enforcement.
- Webhook signing/retry tests.

Out of scope:
- AI extraction enhancements.

Implementation slices:
- Ticket 013A - Schema And Domain Foundation: Complete. Added Prisma models, migration, generated client, seed data, validation schemas, metric extraction helpers, API key hashing helpers, webhook signing helpers, and unit tests.
- Ticket 013B - Forms APIs: Complete. Added form CRUD, immutable version creation, publish, assignment APIs, audit logs, tenant isolation checks, and route integration tests.
- Ticket 013C - Form Builder Persistence UI: Complete. Wired `/forms` to API-backed data for list, save draft, publish, and assign flows with fixture fallback only when the forms API is unavailable.
- Ticket 013D - Submissions, Check-Ins, And Metrics: Complete. Added assignment detail/submission, form submission list/detail, check-in queue/detail/review/complete, extracted metrics, client metrics APIs, idempotent metric extraction, API-backed check-in UI, and tests.
- Ticket 013E - External Read APIs: Complete. Added external API key authentication, scopes, expiry/revocation/IP/rate-limit checks, audit logs, cursor pagination, PII gating, de-identification, and external clients/metrics/submissions/check-ins endpoints.
- Ticket 013F - Exports And Webhooks: Complete. Added external export create/status APIs, webhook endpoint create/list/update/disable APIs, one-time signing secrets, non-retrievable secret storage, pending webhook delivery records, and retry-ready status documentation.
- Ticket 013G - M4 Review Gate: Complete. Ran the mandatory phase review against specs, checklist, code, migrations, tests, and deployed behavior; closed the remaining E2E coverage/docs gaps.

## Ticket 014 - Training Persistence
Status: Complete. Tickets 014A through 014F are complete with schema, exercise APIs, seed data, API-backed exercise UI persistence, API-backed program library assignment UI, scoped exercise media upload authorization, client profile training integration, E2E training flow coverage, and the mandatory M5 review gate.

Scope:
- Exercise libraries.
- Training templates.
- Assignment snapshots.
- R2 signed upload path for exercise videos.

Depends on:
- Ticket 011.

Tests:
- Library isolation.
- Assignment snapshot immutability.
- Signed URL authorization.

Out of scope:
- Nutrition.

Implementation slices:
- Ticket 014A - Schema, Exercise API, And Exercise UI Persistence: Complete. Added training schema, migration, seed data, exercise APIs, template/assignment API foundations, API-backed exercise database, add-exercise persistence, docs, and tests.
- Ticket 014B - Training Template And Assignment UI Persistence: Complete. Wired program library screens to persisted templates and assignments, added template creation from the UI, added template-to-client assignment UI, and covered the flows with component tests.
- Ticket 014C - Exercise Media Upload Authorization: Complete. Added R2-compatible signed PUT URL generation, exercise media upload validation, organization-scoped object keys, audit logging, and create/update validation so exercise media keys must come from the active organization upload path.
- Ticket 014D - Client Training Integration: Complete. Client profile Training tab now loads persisted assignment snapshots through `GET /api/v1/clients/{client_id}/training-programs`, derives assigned program cards and weekly schedule rows from immutable snapshot JSON, and retains fixture fallback behavior.
- Ticket 014E - Training E2E Coverage: Complete. Added Playwright coverage for API-backed exercise creation and program template creation through client assignment, including request payload assertions.
- Ticket 014F - M5 Review Gate: Complete. Ran the mandatory phase review against specs, checklist, code, migrations, tests, and deployed behavior; closed the pending Neon migration/seed gap and verified M5 end to end.

## Ticket 015 - Nutrition Persistence
Status: In Progress. Tickets 015A and 015B are complete with food library persistence plus meal template/assignment schema, APIs, seed data, API-backed meal plan UI, docs, and tests.

Scope:
- Food libraries.
- Meal templates.
- Meal assignments and snapshots.

Depends on:
- Ticket 011.

Tests:
- Library isolation.
- Assignment snapshot immutability.

Out of scope:
- Payments.

Implementation slices:
- Ticket 015A - Food Library Persistence Foundation: Complete. Added food library schema, migration, seed data, food APIs, API-backed food database UI, fixture fallback, docs, and tests.
- Ticket 015B - Meal Template And Assignment Persistence: Complete. Added meal template/assignment schema, immutable assignment snapshots, APIs, seed data, API-backed meal plan UI, docs, and tests.
- Ticket 015C - Client Nutrition Integration: load client profile nutrition data from persisted meal plan assignments.
- Ticket 015D - Nutrition E2E Coverage: cover food creation, meal template creation, and meal assignment flows.
- Ticket 015E - M6 Review Gate: run the mandatory phase review against specs, checklist, code, migrations, tests, and deployed behavior.

## Ticket 016 - Messaging, Tasks, Notifications, Email
Scope:
- Conversations/messages/attachments/read receipts.
- Tasks.
- Notification records.
- Resend transactional email workflow.

Depends on:
- Ticket 011.

Tests:
- Message persistence/read receipts.
- Attachment access checks.
- Email event persistence.

Out of scope:
- SMS/WhatsApp.

## Ticket 017 - Stripe Connect And Packages
Scope:
- Stripe Connect onboarding.
- Package/product/price mapping.
- Client subscriptions.
- Stripe webhook processing.
- Revenue data.

Depends on:
- Ticket 011.

Tests:
- Webhook signature/idempotency.
- Subscription status transitions.
- Payment audit logs.

Out of scope:
- Tax/accounting automation.

## Ticket 018 - Education And Supplementation Persistence
Scope:
- Education resources and assignments.
- Supplement libraries/templates/assignments.
- R2 resource upload metadata.

Depends on:
- Ticket 011.

Tests:
- Resource assignment.
- Supplement protocol persistence.
- Library isolation.

Out of scope:
- AI recommendations.

## Ticket 019 - Production Hardening
Scope:
- Sentry.
- Structured logging.
- Rate limits.
- Security pass.
- Performance pass.
- Accessibility pass.
- Deployment docs.

Depends on:
- Core MVP persistence tickets.

Tests:
- Security review.
- Coverage gates.
- E2E critical flows.
- Build and deploy smoke.

Out of scope:
- Full social integrations.
- User-facing AI automation.
