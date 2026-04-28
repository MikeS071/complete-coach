# ADR-003: Data Storage And Integrations

## Status
Accepted for planning

## Context
The product needs durable relational data, binary media storage, payments, email, background jobs, and observability.

## Decision
Use PostgreSQL on Neon with Prisma, Cloudflare R2 for object storage, Stripe Billing with Stripe Connect for payments, Resend for transactional email, Inngest for durable background jobs, and Sentry plus structured logs for observability.

## Consequences
Positive:
- PostgreSQL supports the multi-tenant relational model.
- Prisma provides migrations and type-safe access.
- Neon pairs well with Vercel and environment branching.
- R2 is S3-compatible and cost-effective for media-heavy workflows.
- Stripe Connect supports tenant-owned payment flows.
- Inngest reduces background job infrastructure overhead.

Negative:
- Multiple providers require disciplined environment configuration.
- Local development needs mocks or test credentials for external services.
- Stripe Connect introduces onboarding and webhook complexity.

Alternatives considered:
- Supabase for DB/auth/storage. Rejected because NextAuth, Neon, and R2 were selected.
- AWS-only infrastructure. Rejected for MVP operating overhead.
- Self-hosted queues. Rejected for unnecessary early complexity.

