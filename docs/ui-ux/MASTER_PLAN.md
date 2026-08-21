# RabbitRip UI/UX Master Plan

## Objective

Bring the RabbitRip web client to a stable, production-quality UI/UX without changing working product behavior unnecessarily.

## Five-phase execution contract

### Phase 1 — Audit and design foundation
- Establish visual tokens and interaction rules.
- Remove global accessibility regressions and conflicting one-off CSS.
- Standardize focus, reduced-motion, touch, safe-area, scrollbar, selection, and media behavior.
- Audit all routes/components before page-specific redesign.

### Phase 2 — Navigation and discovery
- Stabilize desktop/mobile navigation.
- Fix route transitions, active states, search/discovery flows, grids, cards, empty/loading/error states, and responsive behavior.
- Preserve existing data and routing contracts.

### Phase 3 — Details and playback
- Stabilize title details, TV episode selection, player entry/exit, playback states, source selection, subtitles, resume, and failure recovery.
- Treat the existing streaming implementation as an API contract; do not rewrite it unless verification identifies a defect.

### Phase 4 — Visual refinement
- Apply one coherent RabbitRip visual language across hero areas, cards, controls, typography, spacing, surfaces, and motion.
- Prefer restrained cinematic styling over decorative effects.

### Phase 5 — Hardening and release QA
- Verify routes, responsive layouts, keyboard/focus behavior, reduced motion, loading/error states, player edge cases, network failures, performance, and production deployment.
- No phase is complete until regressions introduced by that phase are resolved.

## Design principles

1. Function before decoration.
2. Reuse existing components before creating parallel variants.
3. One source of truth for tokens and interaction states.
4. Touch targets must remain comfortable on mobile.
5. Focus indication must never be removed without an accessible replacement.
6. Motion must communicate state, not decorate every interaction.
7. Loading, empty, error, and retry states are first-class UI.
8. Existing API, auth, player, and routing contracts are preserved unless a verified defect requires change.
9. No new dependency without a concrete requirement.
10. Production behavior is the acceptance target, not only a local screenshot.

## Definition of done

A phase is complete only when implementation, type/build validation, responsive inspection, accessibility checks, and regression checks for the touched flows are complete.
