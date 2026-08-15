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

## Current Status — CLEANUP PHASES 1–4

### Completed
- Home Trending is driven by catalog data rather than a fixed Reacher/Spider-Man snapshot.
- Obsolete Spark demo/duplicate implementation removed.
- Viewing completion and Continue Watching state are consolidated around the existing history model.
- “Your next Bingr after” is driven by the actual most recently completed title and existing recommendation/similar APIs.
- Broken Home category navigation was replaced with supported application routes.
- Studios and Popular Genres cards now navigate instead of being dead UI.
- Phase 5 server-selector consolidation is intentionally deferred and must not be changed unless explicitly requested.

### Streaming architecture — DO NOT CHANGE
- Bingr and CinePro are separate systems; **do not route Bingr through CinePro**.
- Existing Bingr extraction/request flow remains in `useBingrSources` + dedicated Vercel function `artifacts/allrated/api/bingr/stream.js`.
- Real upstream request is `POST https://api.bingr.one/api/stream`.
- `useHlsPlayer` remains the playback layer and `/api/proxy` remains the media proxy.
- TV watch URLs use `/watch/tv/:id/:season/:episode` and pass the actual season/episode into the existing Bingr POST request.

### Runtime verification still required
- Deploy `main` and verify Bingr stream HTTP 200 with `sources` and `subtitles`.
- Finish a movie/episode and verify Home shows recommendations for that exact completed title.
- Verify TV S/E values reach the Bingr request.
- Verify subtitle rendering and existing player behavior.
- Verify Studios/Genres navigation on mobile and desktop.

## Important
Do not claim production/runtime parity until the deployed build has been tested. Do not modify Phase 5 server-selector behavior without explicit user instruction.
