# Decision Log

## 2026-08-06 — Removed Studios/Genres/Languages rows from Home.tsx
**Context:** bingr.one CDN images 404 for external users.
**Decision:** Removed StudiosTray, PopularGenresTray, PopularLanguagesTray from Home.tsx.
**Reversal risk:** HIGH (if we get working CDN)
**File:** artifacts/allrated/src/pages/Home.tsx

## 2026-08-06 — Session key unified to allrated_session_id
**Context:** bingr_session + allrated_session_id mismatch caused auth bugs.
**Decision:** Unified to allrated_session_id everywhere.
**Reversal risk:** MEDIUM
**Files:** All auth-related files

## 2026-08-06 — MobileNav is liquid glass floating pill
**Context:** bingr.one has centered floating nav with blur.
**Decision:** Custom backdrop-filter component with 6 tabs, swipe gestures, toast labels.
**Reversal risk:** LOW
**File:** artifacts/allrated/src/components/MobileNav.tsx

## 2026-08-06 — MobileBottomNav is separate component (SVG icons)
**Context:** MobileNav was too complex for some pages.
**Decision:** Simpler MobileBottomNav with custom SVG icons for basic pages.
**Reversal risk:** LOW
**File:** artifacts/allrated/src/components/MobileBottomNav.tsx

## 2026-08-11 — Title cards 160px with numbers bottom-left
**Context:** Cards were too small, numbers overlapped content.
**Decision:** 160px width, numbered variant shows index bottom-left behind poster gradient.
**Reversal risk:** LOW
**File:** artifacts/allrated/src/components/TitleCard.tsx
