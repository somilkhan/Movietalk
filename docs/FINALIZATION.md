# RabbitRip Finalization Rules

This document defines the engineering bar for final polish work. It is intentionally additive to `AGENTS.md` and does not change runtime architecture.

## Non-negotiable rules

1. Preserve public routes and existing product capabilities unless a deliberate migration is documented.
2. Preserve the Supabase Auth, Neon/PostgreSQL, TMDB, and streaming-provider boundaries.
3. Prefer small, reversible changes over broad rewrites.
4. Every UI change must remain usable on narrow mobile screens and desktop.
5. Every interactive control must have visible keyboard focus and an accessible name where an icon is used without text.
6. Respect `prefers-reduced-motion`; animation must never be required to understand or operate the UI.
7. Never commit credentials, provider secrets, cookies, or production environment values.
8. Do not add a new dependency when an existing workspace dependency solves the problem.
9. Before merging, inspect the diff and require typecheck, formatting, and production build to pass.
10. If a change affects persistence or an API contract, trace its callers before modifying it.

## Visual quality gate

- Clear hierarchy: one primary action per meaningful region.
- Consistent spacing, radius, typography, borders, and elevation.
- No accidental horizontal overflow at mobile widths.
- Loading, empty, error, and disabled states are intentional rather than browser defaults.
- Focus states remain visible against dark surfaces.
- Images and video do not cause layout-breaking overflow.
- Motion is subtle and supports hierarchy rather than decoration.

## Verification order

`READ → TRACE → PLAN → EDIT → TYPECHECK → FORMAT → BUILD → REVIEW DIFF → VERIFY DEPLOYMENT`

A green build alone is not a visual sign-off. UI work must also be checked at mobile and desktop breakpoints.
