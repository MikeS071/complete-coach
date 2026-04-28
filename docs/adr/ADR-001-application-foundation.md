# ADR-001: Application Foundation

## Status
Accepted for planning

## Context
Complete Coach needs a production foundation for a React/shadcn UI, authenticated multi-tenant SaaS workflows, PostgreSQL persistence, and API/webhook integrations. The supplied UI design is a Vite React prototype, but the chosen authentication provider is NextAuth/Auth.js and the product needs server-side route protection, API routes, and deployment on Vercel.

## Decision
Use Next.js App Router for the primary web application in `apps/web`.

## Consequences
Positive:
- NextAuth/Auth.js integration is straightforward.
- Route handlers and UI live in one deployable unit for MVP speed.
- Vercel deployment is first-class.
- Server components/actions can be used selectively.
- App Router maps cleanly to the route inventory from the UI design.

Negative:
- The Figma-exported Vite router must be ported.
- Some client-heavy pages need explicit `"use client"` boundaries.
- Care is needed to avoid mixing server-only code into client components.

Alternatives considered:
- Keep Vite React plus separate API service. Rejected because auth/session/API integration would require more glue before the product foundation exists.
- Separate frontend and backend services from day one. Rejected for MVP complexity.

