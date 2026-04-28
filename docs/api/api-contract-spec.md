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
- `GET /api/v1/forms`
- `POST /api/v1/forms`
- `GET /api/v1/forms/{form_id}`
- `PATCH /api/v1/forms/{form_id}`
- `POST /api/v1/forms/{form_id}/versions`
- `POST /api/v1/forms/{form_id}/publish`
- `POST /api/v1/forms/{form_id}/assignments`
- `GET /api/v1/form-assignments`
- `GET /api/v1/form-submissions`
- `GET /api/v1/form-submissions/{submission_id}`

### Check-Ins
- `GET /api/v1/check-ins`
- `GET /api/v1/check-ins/{check_in_id}`
- `POST /api/v1/check-ins/{check_in_id}/review`
- `POST /api/v1/check-ins/{check_in_id}/complete`
- `GET /api/v1/check-ins/{check_in_id}/extracted-metrics`

### Training
- `GET /api/v1/exercises`
- `POST /api/v1/exercises`
- `GET /api/v1/exercises/{exercise_id}`
- `PATCH /api/v1/exercises/{exercise_id}`
- `GET /api/v1/training-program-templates`
- `POST /api/v1/training-program-templates`
- `GET /api/v1/training-program-assignments`
- `POST /api/v1/training-program-assignments`
- `GET /api/v1/clients/{client_id}/training-programs`

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

#### `GET /api/v1/external/clients/{external_client_id}/metrics`
Returns typed metrics for one client.

Filters:
- `metric_key`
- `from`
- `to`
- `source_type`
- `cursor`
- `limit`

#### `GET /api/v1/external/metrics`
Returns organization-wide typed metrics.

Filters:
- `metric_key`
- `from`
- `to`
- `client_external_ids`
- `cursor`
- `limit`

#### `GET /api/v1/external/form-submissions`
Returns de-identified form/check-in submissions.

Filters:
- `form_id`
- `submitted_since`
- `status`
- `cursor`
- `limit`

#### `GET /api/v1/external/check-ins`
Returns typed check-in records and review status.

Filters:
- `status`
- `submitted_since`
- `reviewed_since`
- `cursor`
- `limit`

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
    "export_id": "exp_123",
    "status": "queued"
  }
}
```

#### `GET /api/v1/external/exports/{export_id}`
Returns export status and a short-lived signed download URL when ready.

### External Webhooks
#### `GET /api/v1/external/webhook-endpoints`
List configured endpoints.

#### `POST /api/v1/external/webhook-endpoints`
Create endpoint.

#### `PATCH /api/v1/external/webhook-endpoints/{endpoint_id}`
Update endpoint.

#### `DELETE /api/v1/external/webhook-endpoints/{endpoint_id}`
Disable endpoint.

Supported event types:
- `client.created`
- `client.updated`
- `form.submission.created`
- `check_in.submitted`
- `check_in.reviewed`
- `metric.extracted`
- `export.completed`

Delivery:
- Signed with per-endpoint secret.
- Retry with exponential backoff through Inngest.
- Persist delivery attempts.

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

