# Payments And Packages Persistence

Ticket 017 / M8 connects coaching packages, Stripe Connect, Stripe Billing subscriptions, webhook events, and revenue reporting to durable PostgreSQL records.

## Current State
- Prisma includes `packages`, `client_subscriptions`, and `payment_events`.
- Package APIs can list, create, and update active-organization packages with owner-only payment management authorization.
- Package create/update inputs intentionally reject client-supplied Stripe product and price ids. Stripe identifiers must be set by trusted server-side Stripe sync in a later M8 slice.
- Stripe Connect account-link API can create or reuse an active organization's connected account and return a server-generated onboarding URL.
- Demo seed data creates package records from the UI stub fixtures.

## Ticket 017A Outcome
Completed on May 18, 2026.

Delivered:
- Forward-only Prisma migration for package, client subscription, and payment event persistence.
- Tenant-scoped `GET /api/v1/packages`, `POST /api/v1/packages`, and `PATCH /api/v1/packages/{package_id}` APIs.
- Package serialization includes active subscription count and projected monthly revenue derived from local subscription records.
- Package mutation audit logs avoid secrets, card data, and client-provided Stripe identifiers.
- API tests cover package list/create/update, tenant scoping, payment management authorization, and rejection of client-supplied Stripe identifiers.

## Ticket 017B Outcome
Completed on May 18, 2026.

Delivered:
- `POST /api/v1/stripe/connect/account-link` creates or reuses the active organization's Stripe connected account.
- Stripe secret key is read from environment variables only and is never accepted from clients.
- Connected account creation requests Express onboarding with card payment and transfer capabilities and stores organization metadata in Stripe.
- Initial `stripe_connect_account_id` and `stripe_connect_status` are persisted from trusted Stripe account response flags.
- Account-link URLs are generated server-side for authenticated owners and audited without logging the URL or secret key.
- API tests cover missing Stripe configuration, account creation, account reuse, Stripe API failure mapping, authorization, and status derivation.

## Source Specs
- `docs/architecture/data-model-spec.md`
- `docs/api/api-contract-spec.md`
- `docs/roadmap/implementation-roadmap.md`
- `docs/roadmap/implementation-ticket-map.md`
- `docs/checklists/m8-payments-packages-checklist.md`
- `docs/adr/ADR-003-data-storage-and-integrations.md`

## Data Model
- `packages`: organization-scoped package catalog records with price amount, currency, billing interval, local status, optional UI metadata, and trusted Stripe product/price ids.
- `client_subscriptions`: organization/client/package subscription mirrors with Stripe customer/subscription ids and Stripe-derived status/period fields.
- `payment_events`: organization-scoped Stripe webhook/event records keyed by Stripe event id for idempotent processing.

Rules:
- Package reads require `payments:read`.
- Package writes require `payments:manage`.
- Stripe product and price ids are not accepted from browser/API clients.
- Stripe Connect account links require `payments:manage` and server-side `STRIPE_SECRET_KEY`.
- Stripe webhook events are the authoritative source for subscription/payment state once webhook processing is implemented.
- Audit logs must not expose secrets, card details, or raw payment credentials.

## API Surface
- `GET /api/v1/packages`
- `POST /api/v1/packages`
- `PATCH /api/v1/packages/{package_id}`
- `POST /api/v1/stripe/connect/account-link`

## Remaining M8 Work
- Ticket 017C: trusted Stripe product/price sync for packages.
- Ticket 017D: client subscription creation.
- Ticket 017E: Stripe webhook signature verification, event persistence, and idempotent state transitions.
- Ticket 017F: API-backed packages UI and revenue dashboard persistence.
- Ticket 017G: payments/package E2E coverage.
- Ticket 017H: mandatory M8 review gate.
