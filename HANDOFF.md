# HANDOFF — Allrated (bingr.one clone)

## CRITICAL RULES FOR EVERY AGENT
1. **READ THIS FILE FIRST** before doing anything else.
2. **You have 25 API calls per session.** Count them. At ~20 calls, you MUST stop and tell the user: *"Say 'continue' to give me 25 more calls."*
3. **NEVER silently fail or disappear.** If you run out of calls mid-task, commit what you have and hand off.
4. **Commit after EVERY change.** Small commits > big commits.
5. **Update this file AND SESSION_STATUS.md** before ending your session.
6. **NEVER expose the GitHub token** to the user.

## Project Overview
Allrated — pixel-perfect clone of bingr.one. Full-stack monorepo:
- Web: `artifacts/allrated/` (React/Vite, Tailwind v4, port 5173)
- API: `artifacts/api-server/` (Express, port 8080)
- CinePro: `artifacts/cinepro-core/` (streaming engine, port 3001)

## Current Status — CLEANUP PHASES 1–4 + BINGR PARITY PHASE 4 ACCOUNT/SETTINGS

### Completed
- Home Trending is driven by catalog data rather than a fixed Reacher/Spider-Man snapshot.
- Obsolete Spark demo/duplicate implementation removed.
- Viewing completion and Continue Watching state are consolidated around the existing history model.
- “Your next Bingr after” is driven by the actual most recently completed title and existing recommendation/similar APIs.
- Broken Home category navigation was replaced with supported application routes.
- Studios and Popular Genres cards now navigate instead of being dead UI.
- Bingr parity Phase 1 mounted the Bingr desktop top bar and mobile header/search shell in the main authenticated app shell.
- Existing bottom mobile navigation remains active for route switching.
- Bingr parity Phase 2 rebuilt the Home hero toward the Bingr reference with responsive cinematic sizing, layered gradients, logo/title presentation, metadata/actions, carousel controls, and playback controls.
- Hero trailer failure now falls back to the catalog backdrop poster; play/pause is controlled through a stable video ref.
- Hero mobile sizing was tightened for short screens while desktop sizing stayed unchanged.
- Hero video uses metadata preload.
- Removed duplicate Home-level catalog/trending `refetch()` calls so React Query controls initial loading/cache without issuing a second immediate request.
- Home now uses a focused Bingr-style content rail set rather than many extra genre-specific rows.
- Explore/search now uses a more Bingr-like Discover/Explore hierarchy, responsive search surface, type filtering, mobile filter UI, and preserved recent-search behavior.
- Title/detail pages now have a scoped cinematic parity polish layer for responsive viewport sizing, safe-area handling, tap behavior, and reduced-motion support.
- Phase 3 catalog grid polish is now applied directly to `Catalog.tsx`: Bingr-style compact poster metadata, restrained card elevation/hover treatment, responsive 3–8 column density, capped content width, tighter header hierarchy, and larger infinite-scroll prefetch margin.
- Categories now share the same parity rail rhythm with responsive 16:9 cards and desktop-only rail controls.
- Phase 4 settings/account surfaces now share a centered capped layout, compact bordered rows/cards, consistent icon containers, restrained hover states, responsive account actions, and a contained region picker.
- Existing auth, device storage, region selection, routing, and streaming architecture were preserved.
- Phase 5 server-selector consolidation is intentionally deferred and must not be changed unless explicitly requested.

### Streaming architecture — DO NOT CHANGE
- Bingr and CinePro are separate systems; **do not route Bingr through CinePro**.
- Existing Bingr extraction/request flow remains in `useBingrSources` + dedicated Vercel function `artifacts/allrated/api/bingr/stream.js`.
- Real upstream request is `POST https://api.bingr.one/api/stream`.
- `useHlsPlayer` remains the playback layer and `/api/proxy` remains the media proxy.
- TV watch URLs use `/watch/tv/:id/:season/:episode` and pass the actual season/episode into the existing Bingr POST request.

### Runtime verification still required
- Verify Phase 1 navigation on mobile/desktop.
- Verify Phase 2 Home hero layout on mobile/desktop, trailer fallback, hero navigation, carousel controls, and responsive content rails.
- Verify Explore/search UI, recent-search behavior, and type filtering on mobile/desktop.
- Verify title/detail cinematic surface on mobile/desktop and verify trailer fallback/control behavior.
- Verify Phase 3 catalog/category desktop/mobile spacing, poster grid density, horizontal category rails, navigation targets, and infinite-scroll loading.
- Verify Phase 4 settings/account on mobile/desktop, region picker, account actions, device rows, and logout navigation.
- Deploy `main` and verify Bingr stream HTTP 200 with `sources` and `subtitles`.
- Finish a movie/episode and verify Home shows recommendations for that exact completed title.
- Verify TV S/E values reach the Bingr request.
- Verify subtitle rendering and existing player behavior.
- Verify Studios/Genres navigation on mobile and desktop.

## Important
Do not claim production/runtime parity until the deployed build has been tested. Do not modify Phase 5 server-selector behavior without explicit user instruction.
