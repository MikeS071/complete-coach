# UI Parity Notes

## Status
M1 UI stub gate active.

## Ticket 002 Notes
- Core primitives now follow the shadcn/Radix structure and class patterns from `ui-design/Complete Coach.zip`.
- The full primitive inventory from the design export is not yet ported. Additional primitives must be added as later UI tickets port pages that need them.
- Final font selection is deferred; see `docs/design-system/font-decision.md`.

## Required Updates
Every later UI ticket must document any visual difference from the supplied design screenshots here until the difference is either fixed or explicitly accepted.

## Ticket 010 Notes
- Accessibility-driven labels were added where controls are visually icon-only or otherwise rely on surrounding copy.
- The target-reps range control on the add-exercise page now has an explicit accessible label without changing visible layout.
- Automated visual regression is not enabled; manual comparison remains documented in `docs/design-system/visual-parity-gate.md`.
