# Architecture Specification

## Target Stack
- Web application: Next.js App Router with React and TypeScript.
- UI system: shadcn/Radix primitives, Tailwind CSS v4, design tokens generated from `ui-design/Complete Coach.zip`.
- Auth/session: NextAuth/Auth.js.
- Database: PostgreSQL hosted on Neon.
- ORM/migrations: Prisma.
- Object storage: Cloudflare R2 via S3-compatible API.
- Payments: Stripe Billing and Stripe Connect.
- Email: Resend.
- Background jobs/workflows: Inngest.
- Observability: Sentry, structured JSON logs, persisted audit/event tables.
- Deployment: Vercel for app, managed providers for DB/storage/email/payments/jobs.

## Repository Structure
The implementation should use the harness-recommended structure:
- `apps/web`: Next.js app, route handlers, UI, app-local tests.
- `pkg/auth`: shared auth/session helpers and authorization policies.
- `pkg/db`: Prisma client, database utilities, transaction helpers.
- `pkg/domain`: shared domain types and pure business logic.
- `pkg/api`: API envelopes, validation schemas, client contracts.
- `pkg/storage`: R2 signed URL and object metadata helpers.
- `pkg/email`: Resend templates and send helpers.
- `pkg/jobs`: Inngest function definitions and shared job payload schemas.
- `integrations/stripe`: Stripe Connect/Billing webhook verification and adapters.
- `integrations/resend`: email provider adapter if not kept in `pkg/email`.
- `migrations`: Prisma migrations or generated SQL migration artifacts.
- `docs`: specs, contracts, ADRs, implementation plans, review gates.

Apps must not import sideways from other apps. Shared code belongs in `pkg` or `integrations`.

## High-Level Runtime
### Browser
The browser renders the Next.js React UI, uses server-rendered/session-aware routes where useful, and calls internal API routes or server actions for mutations. The UI begins as a sample-data-backed stub and evolves into data-backed pages.

### Next.js Server
The Next.js server owns:
- Auth callbacks and session access.
- Route handlers under `/api`.
- Server actions where appropriate.
- API validation.
- Authorization checks.
- Database queries through Prisma.
- Signed URL creation for R2 uploads/downloads.
- Stripe webhook receiving.
- Resend transactional email dispatch initiation.
- Inngest event emission.

### PostgreSQL
PostgreSQL is the durable source of truth for tenants, users, clients, forms, submissions, extracted metrics, templates, assignments, messages, tasks, payments, audit logs, API keys, webhook events, and object metadata.

### R2
R2 stores binary assets:
- Avatars.
- Exercise videos.
- Resource files.
- Form photo uploads.
- Client progress photos.
- Message attachments.
- Food/exercise/supplement/media images when not external.

PostgreSQL stores object keys, metadata, owner organization, uploader, content type, byte size, checksum, scan status, and access classification.

### Inngest
Inngest handles durable asynchronous work:
- Stripe webhook processing retries.
- Resend email send/retry workflows.
- External analysis webhook delivery/retry.
- CSV import/export processing.
- Media post-processing.
- Reminder schedules.
- Metric extraction jobs.
- Future AI jobs.

### Stripe
Stripe Connect handles connected coaching business accounts. Stripe Billing handles package subscriptions. Local records mirror Stripe state, but Stripe webhook events are authoritative for subscription/payment status.

## Multi-Tenancy
All tenant-owned domain tables must include `organization_id`. Authorization must enforce that a user can only access records for organizations where they have a membership and sufficient role permissions.

Recommended policy:
- Every request resolves session user and active organization.
- Every service method receives `actor` context containing user id, organization id, role, and scopes.
- Every Prisma query filters by `organization_id` unless operating on global curated library tables.
- Global library records are read-only except to system admins or seed/migration processes.
- Private tenant records are isolated by organization.
- Client portal routes validate client membership against organization-owned client account.

## Authorization Model
Use centralized authorization helpers, not inline ad hoc checks. Example capabilities:
- `clients:read`, `clients:write`, `clients:pii:read`.
- `forms:read`, `forms:write`, `forms:publish`.
- `submissions:read`, `submissions:review`, `metrics:read`.
- `training:read`, `training:write`, `training:assign`.
- `nutrition:read`, `nutrition:write`, `nutrition:assign`.
- `supplements:read`, `supplements:write`, `supplements:assign`.
- `messages:read`, `messages:write`.
- `payments:read`, `payments:manage`.
- `team:read`, `team:manage`.
- `api_keys:manage`, `exports:read`.
- `audit:read`.

Role-to-capability mapping must be documented and tested.

## API Style
Use versioned REST endpoints:
- Public/internal app APIs under `/api/v1`.
- External analysis APIs under `/api/v1/external`.
- Webhooks under `/api/webhooks`.

Responses use a consistent envelope:
```json
{
  "data": {},
  "meta": {},
  "links": {}
}
```

Errors use:
```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": []
  }
}
```

## Validation
All external input must be schema-validated at system boundaries with Zod or equivalent:
- Route params.
- Query params.
- JSON bodies.
- Form submissions.
- Webhook payloads after signature verification.
- File metadata.
- API key creation requests.
- Export filters.

Never trust client-provided `organization_id`; derive active organization from authenticated context except for external API keys where the key is organization-scoped.

## Error Handling
- UI-facing errors must be clear and non-sensitive.
- Server logs may include structured debug context but no secrets, tokens, raw health notes, raw form free-text, payment card details, or unredacted PII.
- Unexpected server errors return generic 500 responses.
- Known validation/domain errors return semantic 400/401/403/404/409/422 status codes.
- All async paths must handle errors explicitly.

## Logging And Audit
### Structured Debug Logging
Every request should include:
- Request id.
- Organization id when available.
- Actor id when available.
- Route/action.
- Status code.
- Duration.
- Error code if failed.

Do not log:
- Passwords.
- Session tokens.
- API keys.
- Stripe secrets.
- Raw form answers containing health data.
- Message body by default.
- Full names/emails/phones unless specifically redacted or hashed.

### Audit Logs
Persist audit events for:
- Login/logout/session security events where available.
- Organization membership and role changes.
- Client record create/update/delete/archive.
- Sensitive client profile view.
- Form publish and submission.
- Check-in review/complete.
- Data export and external API access.
- API key creation/rotation/revocation/use.
- File upload/download.
- Stripe webhook and payment state changes.
- Message attachment access.
- AI-assisted action creation/approval/rejection.

## Security Baseline
- No hardcoded secrets or keys.
- Environment variables validated at startup.
- HTTP-only secure session cookies.
- CSRF protections for state-changing browser requests where applicable.
- Parameterized database access only through Prisma or prepared queries.
- Rate limiting on auth-sensitive and external endpoints.
- Webhook signature verification for Stripe and external deliveries.
- API keys stored hashed, never retrievable after creation.
- Optional IP allowlists for external API keys.
- Signed URLs for R2 with short TTL.
- File upload allowlists for content type, extension, and size.
- Malware scanning hook planned for uploaded files before broad sharing.
- PII and health data minimized in logs and exports.

## Testing Strategy
- Unit tests for pure domain logic, validation schemas, authorization helpers, and data mappers.
- Integration tests for route handlers, Prisma repositories, auth guards, API keys, Stripe webhook processing, and external API exports.
- Component tests for page-level UI interactions.
- E2E tests with Playwright for critical coach and client flows.
- Accessibility tests for route shell, forms, dialogs, keyboard navigation, and focus states.
- Visual regression snapshots for first UI stub against key design routes if tooling is available.
- Coverage gate: 80%+ across touched code.

## Documentation Requirements
Each implementation phase must update:
- Product/technical feature documentation.
- API contracts when handlers change.
- Prisma schema/migration notes when persistence changes.
- ADRs when architecture changes.
- Review gate checklist before merge.

