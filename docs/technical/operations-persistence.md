# Messaging, Tasks, Dashboard Data Persistence

Ticket 016 / M7 replaces local-only operating workflows with persisted conversations, messages, read receipts, tasks, notifications, and email delivery records.

## Current State
- Prisma includes `conversations`, `messages`, `message_attachments`, `message_receipts`, `notifications`, `tasks`, and `email_deliveries`.
- Messaging APIs can create/list conversations, create/list messages, and mark messages read with tenant-scoped access checks.
- Task APIs can create/list/update/complete organization-scoped tasks.
- Notification and email delivery tables exist for later UI and Resend workflow integration.
- Dashboard screens still use fixture/local state until Ticket 016C wires task and dashboard APIs.

## Ticket 016A Outcome
Completed on May 18, 2026.

Delivered:
- Forward-only Prisma migration for messaging, task, notification, and email delivery persistence.
- Tenant-scoped conversation APIs for active organization clients.
- Tenant-scoped message APIs with coach-authored message creation, attachment object references, and read receipt upserts.
- Tenant-scoped task APIs for list, create, update, and completion flows.
- Role capability map now includes `tasks:read` and `tasks:write`.
- API tests cover conversation access, message persistence, read receipts, task CRUD/completion, and validation.
- Verified the full migration stack and seed command against a disposable clean PostgreSQL 16 database.

## Ticket 016B Outcome
Completed on May 18, 2026.

Delivered:
- `/messages` loads conversations from `GET /api/v1/conversations?limit=100` when available.
- Selected persisted conversations load messages from `GET /api/v1/conversations/{conversation_id}/messages?limit=100`.
- Sending a message posts to `POST /api/v1/conversations/{conversation_id}/messages` and appends the persisted response to the thread.
- Fixture-backed conversation and local-send behavior remain available when the API is unavailable.
- Component tests cover persisted conversation load, persisted message load, persisted send, fixture fallback, search, and local send.

## Source Specs
- `docs/architecture/data-model-spec.md`
- `docs/api/api-contract-spec.md`
- `docs/roadmap/implementation-roadmap.md`
- `docs/roadmap/implementation-ticket-map.md`
- `docs/checklists/m7-operations-persistence-checklist.md`

## Data Model
- `conversations`: organization/client conversation shells with optional title and updated timestamp.
- `messages`: organization/conversation-scoped message bodies with exactly one sender type.
- `message_attachments`: message-scoped object references; object authorization is completed in a later M7 slice.
- `message_receipts`: read receipts keyed by message plus user or client.
- `notifications`: recipient-scoped in-app notification records.
- `tasks`: organization-scoped work items with category, priority, status, due date, assignment, client, and completion fields.
- `email_deliveries`: Resend-oriented delivery/event records with provider message id, recipient, subject, status, and error metadata.

Rules:
- All APIs require an active organization.
- Conversation creation requires the target client to belong to the active organization.
- Message reads/writes require the conversation to belong to the active organization.
- Task reads/writes are scoped to the active organization.
- Audit logs must avoid message body and email content.

## API Surface
- `GET /api/v1/conversations`
- `POST /api/v1/conversations`
- `GET /api/v1/conversations/{conversation_id}/messages`
- `POST /api/v1/conversations/{conversation_id}/messages`
- `POST /api/v1/messages/{message_id}/read`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/{task_id}`
- `POST /api/v1/tasks/{task_id}/complete`

## Remaining M7 Work
- Ticket 016C: dashboard task and card persistence.
- Ticket 016D: notification and Resend email workflow.
- Ticket 016E: E2E operations flows.
- Ticket 016F: mandatory M7 review gate.
