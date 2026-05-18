# M8 Payments And Packages Checklist

## Phase Status
- [x] M8 implementation started.
- [x] Ticket 017A package/payment schema and package API foundation complete.
- [ ] Ticket 017B Stripe Connect onboarding and account-link flow complete.
- [ ] Ticket 017C Stripe product/price sync complete.
- [ ] Ticket 017D client subscription creation complete.
- [ ] Ticket 017E Stripe webhook processing and idempotency complete.
- [ ] Ticket 017F packages UI and revenue dashboard persistence complete.
- [ ] Ticket 017G payments E2E coverage complete.
- [ ] Ticket 017H mandatory review gate complete.

## Schema And Migration
- [x] Prisma models exist for packages, client subscriptions, and payment events.
- [x] Package records include local price, currency, billing interval, status, and Stripe product/price mapping fields.
- [x] Client subscription records include client/package links, Stripe customer/subscription ids, status, period dates, and cancel date.
- [x] Payment event records include Stripe event id, event type, redacted payload, processing status, and processed timestamp.
- [x] Migration is forward-only and safe for Neon deployment.
- [x] Demo seed data creates package records.

## Packages
- [x] `GET /api/v1/packages` lists active-organization packages.
- [x] `POST /api/v1/packages` creates active-organization packages.
- [x] `PATCH /api/v1/packages/{package_id}` updates active-organization packages.
- [x] Package create/update rejects client-supplied Stripe product/price ids.
- [ ] Package Stripe product/price mapping is created through trusted server-side Stripe sync.
- [ ] Packages UI prefers persisted API data with fixture fallback.

## Stripe Connect
- [ ] Organization stores Stripe Connect account id and account status.
- [ ] `POST /api/v1/stripe/connect/account-link` creates or reuses a connected account.
- [ ] Stripe Connect account-link response is generated server-side only.
- [ ] Connect account status refresh is persisted from trusted Stripe responses/webhooks.

## Client Subscriptions
- [ ] `GET /api/v1/client-subscriptions` lists tenant-scoped subscriptions.
- [ ] `POST /api/v1/client-subscriptions` creates Stripe-backed client subscriptions.
- [ ] Subscription creation verifies the client and package belong to the active organization.
- [ ] Local subscription status is updated only from trusted Stripe-derived events.

## Webhooks And Events
- [ ] `POST /api/webhooks/stripe` verifies Stripe signatures.
- [ ] Stripe events are persisted idempotently by `stripe_event_id`.
- [ ] Duplicate Stripe events do not reapply state transitions.
- [ ] Webhook processing updates package, subscription, and payment state from trusted payloads.
- [ ] Payment event logs and audit logs do not expose secrets or card details.

## Tests
- [x] API tests cover package list/create/update.
- [x] API tests cover package tenant scoping.
- [x] API tests cover rejecting client-supplied Stripe identifiers.
- [x] API tests cover payment management authorization.
- [x] `pnpm --dir apps/web test -- payments-api.test.ts` passes for Ticket 017A.
- [x] `pnpm --dir apps/web check` passes for Ticket 017A.
- [ ] API tests cover Stripe Connect account-link flow.
- [ ] API tests cover Stripe product/price sync.
- [ ] API tests cover subscription creation.
- [ ] API tests cover Stripe webhook signature verification.
- [ ] API tests cover Stripe webhook idempotency.
- [ ] E2E tests cover package management and subscription flow.
- [ ] `pnpm --dir apps/web check` passes for every M8 slice.

## Mandatory Review Gate
Prompt: "Analyse the phase code and compare to phase specs and determine if there are any gaps. If you find any gaps, close them by implementing the relevant functionality. Each phase cannot proceed or be called complete until there are no gaps between specs and code that was actually delivered and is tested to be working. This is a mandatory requirement."

Review steps:
- [ ] Compare code against payments/packages product scope and this checklist.
- [ ] Compare code against `docs/api/api-contract-spec.md`.
- [ ] Compare code against `docs/architecture/data-model-spec.md`.
- [ ] Compare code against `docs/adr/ADR-003-data-storage-and-integrations.md`.
- [ ] Verify all checklist items above are complete or explicitly deferred outside M8 through updated roadmap docs.
- [ ] Run migrations against a clean database.
- [ ] Run seed against a clean database.
- [ ] Run package API tests.
- [ ] Run Stripe Connect tests.
- [ ] Run subscription API tests.
- [ ] Run Stripe webhook signature and idempotency tests.
- [ ] Run package/subscription E2E flows.
- [ ] Run `pnpm --dir apps/web check`.
- [ ] Close every gap before M8 is marked complete.
