# Remaining UI Stub

## Scope
Ticket 009 ports the remaining prototype surfaces into the launchable Next.js UI stub.

Implemented routes:
- `/education`
- `/education/add`
- `/supplementation`
- `/supplementation/plans`
- `/supplementation/database`
- `/messages`
- `/packages`
- `/team-management`
- `/social-media`

Implemented behavior:
- Education renders the Educational Vault hero, resource tabs, featured content, assignment card, latest resource grid, and resource upload builder.
- Supplementation renders protocol cards, inventory status, supplement plan tabs, active protocol table, protocol library, supplement database search, and local new protocol slide-in creation.
- Messages renders a conversation list, search filtering, active chat panel, conversation switching, and local send behavior.
- Packages renders package summary cards and color-coded package cards with action controls.
- Team management renders team stats, member cards, assigned tasks, and capacity bars.
- Social media renders planning-only analytics, scheduled posts, platform overview, and media/action cards.
- Remaining sample data is stored in typed fixtures.

## Fixture Boundary
Ticket 009 fixture data lives in:
- `apps/web/fixtures/education.ts`
- `apps/web/fixtures/supplementation.ts`
- `apps/web/fixtures/operations.ts`

No production APIs, persistence, social publishing integrations, payment/package mutation, messaging transport, team invitation workflow, file upload, or supplement inventory mutation is implemented in this ticket.

## Verification
Coverage includes:
- Route smoke for every Ticket 009 page.
- Message conversation selection.
- Message search filtering.
- Local message send behavior.
- Supplement database search.
- New protocol slide-in panel creation flow.
- Supplement plan active/library tab switching.

Required commands:
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web coverage`
- `pnpm --dir apps/web build`
- `pnpm check`
