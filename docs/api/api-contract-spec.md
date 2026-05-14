# API Contract Specification

## Standards
- Base path: `/api/v1`.
- External analysis path: `/api/v1/external`.
- Webhooks: `/api/webhooks`.
- Request/response content type: `application/json` unless uploading/downloading files through signed URLs.
- Internal authenticated APIs use NextAuth session cookies.
- External APIs use organization-scoped API keys.
- Webhook requests use provider-specific signatures.

## Response Envelope
Success:
```json
{
  "data": {},
  "meta": {},
  "links": {}
}
```

Collection:
```json
{
  "data": [],
  "meta": {
    "limit": 50,
    "cursor": "next-cursor",
    "has_more": true
  },
  "links": {
    "next": "/api/v1/clients?cursor=next-cursor&limit=50"
  }
}
```

Error:
```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "code": "invalid_format",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

## Status Codes
- `200 OK`: successful read/update with body.
- `201 Created`: successful creation.
- `204 No Content`: successful delete/archive with no body.
- `400 Bad Request`: malformed query/body.
- `401 Unauthorized`: missing/invalid auth.
- `403 Forbidden`: authenticated but not permitted.
- `404 Not Found`: record does not exist or is not visible to actor.
- `409 Conflict`: duplicate or invalid state transition.
- `422 Unprocessable Entity`: semantically invalid request.
- `429 Too Many Requests`: rate limit exceeded.
- `500 Internal Server Error`: unexpected failure.

## Pagination
Use cursor pagination for all growing collections. Cursor must encode stable ordering fields and be opaque to clients.

Default:
- `limit`: 50.
- Max `limit`: 200 for internal APIs.
- Max `limit`: 1000 for external export APIs with explicit export scope.

## Internal App APIs
### Organizations
- `GET /api/v1/organizations`: list organizations available to current user.
- `GET /api/v1/organizations/current`: get active organization context.
- `PATCH /api/v1/organizations/current`: update organization settings.

### Team
- `GET /api/v1/team-members`
- `POST /api/v1/team-members/invitations`
- `PATCH /api/v1/team-members/{membership_id}`
- `DELETE /api/v1/team-members/{membership_id}`

### Clients
- `GET /api/v1/clients`
- `POST /api/v1/clients`
- `GET /api/v1/clients/{client_id}`
- `PATCH /api/v1/clients/{client_id}`
- `POST /api/v1/clients/{client_id}/archive`
- `GET /api/v1/clients/{client_id}/profile`
- `PATCH /api/v1/clients/{client_id}/profile`
- `GET /api/v1/clients/{client_id}/metrics`
- `GET /api/v1/clients/{client_id}/timeline`

Query filters:
- `status`
- `primary_coach_user_id`
- `check_in_day`
- `search`
- `cursor`
- `limit`

### CRM
- `GET /api/v1/leads`
- `POST /api/v1/leads`
- `GET /api/v1/leads/{lead_id}`
- `PATCH /api/v1/leads/{lead_id}`
- `POST /api/v1/leads/{lead_id}/stage-transitions`
- `GET /api/v1/leads/{lead_id}/activities`
- `POST /api/v1/leads/{lead_id}/activities`

### Forms
- `GET /api/v1/forms`: returns active-organization forms. Query: `status`, `type`, `search`, `limit`.
- `POST /api/v1/forms`: creates a form container. Body: `name`, `description`, `type`, optional `status`.
- `GET /api/v1/forms/{form_id}`: returns one active-organization form plus immutable versions.
- `PATCH /api/v1/forms/{form_id}`: updates mutable metadata only. Body: any explicit subset of `name`, `description`, `type`, `status`.
- `POST /api/v1/forms/{form_id}/versions`: creates the next immutable version. Body: validated `schema`, optional `ui`.
- `POST /api/v1/forms/{form_id}/publish`: publishes a version and sets `current_version_id`. Body: `formVersionId`.
- `POST /api/v1/forms/{form_id}/assignments`: assigns a published version to a scoped client. Body: `clientId`, optional `formVersionId`, optional `dueAt`.
- `GET /api/v1/form-assignments`: returns active-organization form assignments. Query: `clientId`, `status`, `limit`.
- `GET /api/v1/form-assignments/{assignment_id}`: returns one active-organization assignment with the immutable assigned form version.
- `POST /api/v1/form-assignments/{assignment_id}/submit`: submits answers for the assigned immutable version, creates a submission, creates a check-in where appropriate, and extracts configured metrics. Body: `answers`.
- `GET /api/v1/form-submissions`: returns active-organization form submissions. Query: `clientId`, `formId`, `status`, `limit`.
- `GET /api/v1/form-submissions/{submission_id}`: returns one active-organization submission with persisted answers and form metadata.

### Check-Ins
- `GET /api/v1/check-ins`: returns active-organization check-ins. Query: `clientId`, `status`, `limit`.
- `GET /api/v1/check-ins/{check_in_id}`: returns one active-organization check-in with persisted submission answers and extracted metrics.
- `POST /api/v1/check-ins/{check_in_id}/review`: transitions a pending check-in to reviewed. Body: optional `summary`, optional `coachNotes`.
- `POST /api/v1/check-ins/{check_in_id}/complete`: transitions a check-in to completed.
- `GET /api/v1/check-ins/{check_in_id}/extracted-metrics`: returns metrics extracted from the check-in submission.

### Client Metrics
- `GET /api/v1/clients/{client_id}/metrics`: returns active-organization client measurements. Query: `metricKey`, `dateFrom`, `dateTo`, `limit`.

### Training
- `GET /api/v1/exercises`: returns global library exercises and active-organization private exercises. Query: `scope`, `category`, `search`, `limit`.
- `POST /api/v1/exercises`: creates a private organization exercise. Body: `name`, `category`, optional `equipment`, `primaryMuscles`, optional `secondaryMuscles`, `difficulty`, optional media object keys, defaults, and execution cues.
- `GET /api/v1/exercises/{exercise_id}`: returns a global or organization-owned exercise.
- `PATCH /api/v1/exercises/{exercise_id}`: updates private organization-owned exercises only; global exercises are read-only to tenant users.
- `POST /api/v1/exercises/media-upload-url`: creates a short-lived signed R2 `PUT` URL for exercise image/video uploads. Body: `mediaType` (`video` or `image`), `filename`, `contentType`, `byteSize`, optional `checksumSha256`. Returns `objectKey`, `uploadUrl`, `expiresAt`, `method`, required headers, max bytes, and media type. Object keys are generated as `organizations/{organization_id}/training/exercises/{media_type}/{uuid}.{extension}`.
- `GET /api/v1/training-program-templates`: returns organization-owned templates. Query: `status`, `limit`.
- `POST /api/v1/training-program-templates`: creates a template with validated JSON days/exercises.
- `GET /api/v1/training-program-assignments`: returns organization-scoped assignments. Query: `clientId`, `limit`.
- `POST /api/v1/training-program-assignments`: assigns a template to a scoped client and writes immutable `snapshot_json`.
- `GET /api/v1/clients/{client_id}/training-programs`: returns training assignments for one organization-scoped client.

### Nutrition
- `GET /api/v1/foods`
- `POST /api/v1/foods`
- `GET /api/v1/meal-plan-templates`
- `POST /api/v1/meal-plan-templates`
- `GET /api/v1/meal-plan-assignments`
- `POST /api/v1/meal-plan-assignments`
- `GET /api/v1/clients/{client_id}/meal-plans`

### Supplementation
- `GET /api/v1/supplements`
- `POST /api/v1/supplements`
- `GET /api/v1/supplement-plan-templates`
- `POST /api/v1/supplement-plan-templates`
- `GET /api/v1/supplement-plan-assignments`
- `POST /api/v1/supplement-plan-assignments`

### Education
- `GET /api/v1/education-resources`
- `POST /api/v1/education-resources`
- `GET /api/v1/education-resources/{resource_id}`
- `PATCH /api/v1/education-resources/{resource_id}`
- `POST /api/v1/education-resources/{resource_id}/assignments`

### Messaging
- `GET /api/v1/conversations`
- `POST /api/v1/conversations`
- `GET /api/v1/conversations/{conversation_id}/messages`
- `POST /api/v1/conversations/{conversation_id}/messages`
- `POST /api/v1/messages/{message_id}/read`

### Tasks
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/{task_id}`
- `POST /api/v1/tasks/{task_id}/complete`

### Files
- `POST /api/v1/files/upload-url`: create signed R2 upload URL.
- `POST /api/v1/files/{object_id}/download-url`: create signed R2 download URL.
- `GET /api/v1/files/{object_id}`: object metadata.

### Packages And Payments
- `GET /api/v1/packages`
- `POST /api/v1/packages`
- `PATCH /api/v1/packages/{package_id}`
- `POST /api/v1/stripe/connect/account-link`
- `GET /api/v1/client-subscriptions`
- `POST /api/v1/client-subscriptions`

### Audit
- `GET /api/v1/audit-logs`

Owner/admin-only by default.

## External Analysis APIs
External APIs are intended for analytics and external data science systems. They are de-identified by default.

### Authentication
Use header:
```http
Authorization: Bearer cc_live_xxxxxxxxx
```

API keys:
- Are scoped to one organization.
- Are stored hashed.
- Include prefix for identification.
- Have scopes.
- Can expire.
- Can be revoked.
- Can optionally restrict IPs.
- Are audited on use.

### Required Scopes
- `external:metrics:read`: read extracted metric data.
- `external:submissions:read`: read de-identified submission metadata and answers allowed by export policy.
- `external:clients:read`: read de-identified client records.
- `external:client_pii:read`: elevated PII access.
- `external:webhooks:manage`: manage webhook endpoints.
- `external:exports:read`: bulk export access.

### De-Identification Rules
Default external responses must not include:
- Name.
- Email.
- Phone.
- Address/location below broad region unless explicitly allowed.
- Photos.
- Free-text notes.
- Message bodies.
- Raw health/injury/medical notes.

Default client identifier:
- Stable `external_client_id`, generated per organization and not equal to internal database id.

PII fields are only returned when:
- API key has `external:client_pii:read`.
- Endpoint supports `include_pii=true`.
- Request is audited.

### Endpoints
#### `GET /api/v1/external/clients`
Returns de-identified clients.

Filters:
- `status`
- `updated_since`
- `cursor`
- `limit`
- `include_pii` requires PII scope.

Response: `{ data, meta }`, where default records include `externalClientId`, broad status, package/check-in metadata, dates, compliance, and timestamps. `firstName`, `lastName`, `email`, and `phone` are returned only when `include_pii=true` and the key has `external:client_pii:read`.

#### `GET /api/v1/external/clients/{external_client_id}/metrics`
Returns typed metrics for one client.

Filters:
- `metric_key`
- `from`
- `to`
- `source_type`
- `cursor`
- `limit`

Response: `{ data, meta }` with typed metric records: `externalClientId`, `sourceType`, `sourceId`, `measuredAt`, `metricKey`, `metricValue`, `unit`, non-PII metadata, and `createdAt`.

#### `GET /api/v1/external/metrics`
Returns organization-wide typed metrics.

Filters:
- `metric_key`
- `from`
- `to`
- `client_external_ids`
- `cursor`
- `limit`

Response: `{ data, meta }` with organization-wide typed metric records. Internal client IDs are never returned.

#### `GET /api/v1/external/form-submissions`
Returns de-identified form/check-in submissions.

Filters:
- `form_id`
- `submitted_since`
- `status`
- `cursor`
- `limit`

Response: `{ data, meta }` with submission metadata and `answers` limited to fields whose immutable form schema marks them as `metadata` or `metric`.

#### `GET /api/v1/external/check-ins`
Returns typed check-in records and review status.

Filters:
- `status`
- `submitted_since`
- `reviewed_since`
- `cursor`
- `limit`

Response: `{ data, meta }` with typed check-in metadata and review status. Raw summary, coach notes, health notes, and submission free text are not returned.

#### `POST /api/v1/external/exports`
Creates an asynchronous export job for larger data pulls.

Request:
```json
{
  "type": "metrics",
  "format": "jsonl",
  "filters": {
    "from": "2026-01-01T00:00:00Z",
    "to": "2026-04-27T00:00:00Z"
  }
}
```

Response:
```json
{
  "data": {
    "exportId": "exp_123",
    "type": "metrics",
    "format": "jsonl",
    "status": "queued",
    "filters": {
      "from": "2026-01-01T00:00:00Z",
      "to": "2026-04-27T00:00:00Z"
    },
    "createdAt": "2026-05-14T00:00:00.000Z",
    "updatedAt": "2026-05-14T00:00:00.000Z",
    "completedAt": null
  }
}
```

#### `GET /api/v1/external/exports/{export_id}`
Returns export status and a short-lived signed download URL when ready.

Completed exports return `downloadUrl`; internal object storage keys are never returned.

### External Webhooks
#### `GET /api/v1/external/webhook-endpoints`
List configured endpoints.

Filters:
- `status`
- `limit`

Response records include `id`, `url`, `description`, `eventTypes`, `status`, `createdAt`, and `updatedAt`. Signing secrets and secret hashes are never returned.

#### `POST /api/v1/external/webhook-endpoints`
Create endpoint.

Request:
```json
{
  "url": "https://analysis.example.com/webhooks/complete-coach",
  "description": "Analysis event receiver",
  "eventTypes": ["external_export.created", "metric.extracted"]
}
```

Response includes `signingSecret` once at creation. The secret is stored only as a hash and is not retrievable later.

#### `PATCH /api/v1/external/webhook-endpoints/{endpoint_id}`
Update endpoint.

Mutable fields: `url`, `description`, `eventTypes`.

#### `DELETE /api/v1/external/webhook-endpoints/{endpoint_id}`
Disable endpoint without deleting delivery history.

Supported event types:
- `external_export.created`

Delivery:
- Signed with per-endpoint secret.
- Ticket 013F persists retry-ready delivery records with `status`, `attempt_count`, `next_retry_at`, and `last_error`.
- Outbound HTTP delivery and exponential backoff worker execution are deferred until background workers are introduced.

Signature headers:
```http
X-Complete-Coach-Event: metric.extracted
X-Complete-Coach-Delivery: whd_123
X-Complete-Coach-Timestamp: 1777248000
X-Complete-Coach-Signature: v1=...
```

## Provider Webhooks
### Stripe
Endpoint: `POST /api/webhooks/stripe`

Requirements:
- Verify Stripe signature.
- Persist raw event payload or normalized event with redaction policy.
- Idempotently process by `stripe_event_id`.
- Emit internal Inngest event for slow downstream work.

### Resend
Endpoint: `POST /api/webhooks/resend`

Requirements:
- Verify signature if configured.
- Persist delivery/bounce/complaint events.
- Update notification/email delivery status.

### Inngest
Endpoint: `/api/inngest` or provider-required route.

Requirements:
- Keep function payload schemas versioned.
- Log run ids and failures.
