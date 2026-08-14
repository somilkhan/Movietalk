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

## Current Status — BINGR WATCH STREAM ROUTING FIX

### Completed
- Existing Bingr extraction path remains in `useBingrSources` + `useHlsPlayer`.
- New Bingr-style watch player shell remains in `artifacts/allrated/src/pages/BingrWatch.tsx`.
- `/watch/:mediaType/:id` remains routed to the new player.
- **Bingr is kept separate from CinePro.** Do not route Bingr through CinePro.
- Added dedicated Vercel function `artifacts/allrated/api/bingr/stream.js` which forwards the existing POST body to the user's Bingr API at `https://api.bingr.one/api/stream`.
- Added Vercel function configuration for the dedicated Bingr endpoint.

### Critical evidence from supplied DevTools HAR
The real Bingr site sends `POST https://api.bingr.one/api/stream` with JSON and receives HTTP 200 JSON. The local Allrated deployment was instead sending `POST /api/bingr/stream` and receiving HTTP 404. Therefore the player was failing before source selection/playback.

### Rules
- Do NOT replace Bingr with CinePro.
- Do NOT change the extraction/provider/server implementation unless runtime evidence proves it is broken.
- Do NOT rework `useHlsPlayer` until the Bingr source response is confirmed healthy.
- After deployment, verify `/api/bingr/stream` returns the same JSON shape as the real Bingr upstream.

## Next Tasks
1. Deploy the two latest commits to Vercel.
2. Confirm `POST /api/bingr/stream` is HTTP 200 in Vercel logs.
3. Confirm response contains `sources` and `subtitles`.
4. Only then debug actual video playback if the player still fails.
5. Runtime QA of mobile/desktop player after streaming is restored.

## Token
Repo: `somilkhan/Movietalk`
Use GitHub API with the stored token. NEVER expose it.
