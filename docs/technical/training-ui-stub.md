# Training UI Stub

## Scope
Ticket 007 ports the training overview, program library, exercise database, and add-exercise surface into the Next.js UI stub.

Implemented behavior:
- `/training` renders training stats, program cards, and recent workout activity.
- `/training/programs` renders active client programs and master templates with local tab switching.
- `/training/exercises` renders exercise search and category filtering.
- `/training/exercises/add` renders local exercise-entry controls for basics, anatomy, volume, video placeholder, and coaching cues.
- Sample training records live in typed fixtures.

## Fixture Boundary
Training fixtures live in `apps/web/fixtures/training.ts`.

No production APIs, R2 uploads, persistence, or client assignment mutations are implemented in this ticket.

## Verification
Coverage includes:
- Training overview render.
- Program tab switching.
- Exercise search.
- Exercise category filtering.
- Add-exercise local form updates.
- Coaching cue creation.
- Anatomy target toggling.

Required commands:
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web coverage`
- `pnpm --dir apps/web build`
- `pnpm check`
