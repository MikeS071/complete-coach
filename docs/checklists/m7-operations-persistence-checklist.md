# M7 Messaging, Tasks, Dashboard Data Checklist

## Phase Status
- [x] M7 implementation started.
- [x] Ticket 016A messaging/task/notification/email schema and API foundation complete.
- [ ] Ticket 016B messages UI persistence complete.
- [ ] Ticket 016C dashboard task and card persistence complete.
- [ ] Ticket 016D notification and Resend email workflow complete.
- [ ] Ticket 016E E2E operations flows complete.
- [ ] Ticket 016F mandatory review gate complete.

## Schema And Migration
- [x] Prisma models exist for conversations, messages, attachments, and read receipts.
- [x] Prisma model exists for in-app notifications.
- [x] Prisma model exists for task CRUD and completion.
- [x] Prisma model exists for email delivery events.
- [x] Migration is forward-only and safe for Neon deployment.
- [ ] Demo seed data creates conversations, messages, tasks, notifications, and email delivery records.

## Messaging
- [x] `GET /api/v1/conversations` lists tenant-scoped conversations.
- [x] `POST /api/v1/conversations` creates conversations only for organization-scoped clients.
- [x] `GET /api/v1/conversations/{conversation_id}/messages` lists tenant-scoped messages.
- [x] `POST /api/v1/conversations/{conversation_id}/messages` creates coach-authored messages.
- [x] `POST /api/v1/messages/{message_id}/read` creates/upserts read receipts.
- [ ] Message attachments are validated against organization-owned R2 object metadata before send.
- [ ] Messages UI prefers persisted API data with fixture fallback.
- [ ] Messages UI can send persisted messages.

## Tasks And Dashboard
- [x] `GET /api/v1/tasks` lists organization-scoped tasks.
- [x] `POST /api/v1/tasks` creates organization-scoped tasks.
- [x] `PATCH /api/v1/tasks/{task_id}` updates organization-scoped tasks.
- [x] `POST /api/v1/tasks/{task_id}/complete` completes organization-scoped tasks.
- [ ] Dashboard Work To-Do uses persisted tasks.
- [ ] Dashboard task creation panel creates persisted tasks.
- [ ] Dashboard summary cards use real tenant data for available domains.

## Notifications And Email
- [x] Notification records have recipient, entity, read state, and created timestamp fields.
- [x] Email delivery records have provider, provider email id, recipient, subject, status, event type, and error fields.
- [ ] Notification APIs list and mark notifications read.
- [ ] Resend send helper records queued/sent/failed email delivery status.
- [ ] Resend webhook persists delivery/bounce/complaint events.
- [ ] Logs redact message bodies and email contents by default.

## Tests
- [x] API tests cover conversation creation/listing and inaccessible client rejection.
- [x] API tests cover message creation/listing and read receipts.
- [x] API tests cover task creation/listing/update/completion.
- [x] API tests cover invalid task validation.
- [x] `pnpm --dir apps/web test -- operations-api.test.ts` passes for Ticket 016A.
- [ ] Component tests cover messages UI persistence.
- [ ] Component tests cover dashboard task persistence.
- [ ] API tests cover notification/email delivery workflows.
- [ ] E2E tests cover messaging/task/dashboard flows.
- [x] `pnpm --dir apps/web check` passes for Ticket 016A.

## Mandatory Review Gate
Prompt: "Analyse the phase code and compare to phase specs and determine if there are any gaps. If you find any gaps, close them by implementing the relevant functionality. Each phase cannot proceed or be called complete until there are no gaps between specs and code that was actually delivered and is tested to be working. This is a mandatory requirement."

Review steps:
- [ ] Compare code against operations product scope and this checklist.
- [ ] Compare code against `docs/api/api-contract-spec.md`.
- [ ] Compare code against `docs/architecture/data-model-spec.md`.
- [ ] Verify all checklist items above are complete or explicitly deferred outside M7 through updated roadmap docs.
- [ ] Run migrations against a clean database.
- [ ] Run seed against a clean database.
- [ ] Run messaging API tests.
- [ ] Run task API tests.
- [ ] Run dashboard data tests.
- [ ] Run notification/email workflow tests.
- [ ] Run E2E messaging/task/dashboard flows.
- [ ] Run `pnpm --dir apps/web check`.
- [ ] Close every gap before M7 is marked complete.
