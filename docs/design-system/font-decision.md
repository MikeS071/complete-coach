# Font Decision

## Status
Proposed for UI stub

## Context
The Figma-exported bundle includes an empty `src/styles/fonts.css`, so there is no embedded font source to copy verbatim. The screenshots use a bold geometric sans style that should be matched during the full UI port.

## Decision
Ticket 002 does not add a remote font dependency. The scaffold preserves the exported typography tokens from `docs/design-system/complete-coach-theme.css` and leaves final font selection to the visual parity pass.

Preferred implementation direction for the full UI stub:
- Use a licensed, self-hosted or framework-hosted font that closely matches the screenshots.
- Candidate families: Geist Sans or Satoshi.
- Document the final selected font before visual parity sign-off.

## Constraints
- No font API keys or provider secrets.
- No layout-shifting font loading.
- No generic browser default if it visibly diverges from the supplied UI design.
