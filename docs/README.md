# Complete Coach Planning Docs

## Planning Baseline
This directory is the source of truth for implementing Complete Coach. The project is still in planning phase; no product implementation should begin until these docs are reviewed and accepted.

## Core Docs
- [Product Spec](product/product-spec.md): product scope, confirmed decisions, domains, MVP success criteria.
- [UI Design Analysis](design-system/ui-design-analysis.md): analysis of `ui-design/Complete Coach.zip`, route inventory, visual parity rules, risks.
- [Generated Theme](design-system/complete-coach-theme.css): stylesheet baseline generated from the UI design export.
- [Visual Parity Gate](design-system/visual-parity-gate.md): M1 route, accessibility, and manual visual parity gate.
- [Architecture Spec](architecture/architecture-spec.md): stack, structure, runtime, tenancy, auth, logging, testing.
- [Data Model Spec](architecture/data-model-spec.md): planned PostgreSQL/Prisma domain model.
- [API Contract Spec](api/api-contract-spec.md): internal APIs, external analysis APIs, webhook contracts.
- [UI Stub First Deliverable](specs/ui-stub-first-deliverable.md): first implementation milestone with acceptance criteria.
- [Implementation Roadmap](roadmap/implementation-roadmap.md): phased delivery plan.
- [Implementation Ticket Map](roadmap/implementation-ticket-map.md): downstream ticket sequence.
- [Production Checklist](checklists/production-readiness-checklist.md): release/readiness gates.
- [Vercel Preview Deployment](deployment/vercel-neon-preview.md): deploy the M1 fixture-backed UI preview.
- [Auth And Tenant Foundation](technical/auth-tenant-foundation.md): Ticket 011 Auth.js, Prisma, tenancy, migration, and environment notes.
- [Client And CRM Persistence](technical/client-crm-persistence.md): Ticket 012 client/lead schema, APIs, tenancy, and verification notes.

## ADRs
- [ADR-001 Application Foundation](adr/ADR-001-application-foundation.md)
- [ADR-002 Auth Tenancy And Roles](adr/ADR-002-auth-tenancy-and-roles.md)
- [ADR-003 Data Storage And Integrations](adr/ADR-003-data-storage-and-integrations.md)
- [ADR-004 Forms Checkins And External Analysis](adr/ADR-004-forms-checkins-and-external-analysis.md)

## Execution Rule
Implementation must proceed ticket-by-ticket. Each ticket must include:
- Assumptions.
- Scope boundary.
- Explicit out-of-scope items.
- Tests written before implementation.
- Docs/contracts/migrations updated with code.
- Verification commands and results.
