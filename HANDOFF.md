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

## Current Status — BINGR WATCH PLAYER

### Streaming architecture
- Bingr and CinePro are separate systems; **do not route Bingr through CinePro**.
- Existing Bingr extraction/request flow remains in `useBingrSources` + the dedicated Vercel function `artifacts/allrated/api/bingr/stream.js`.
- The real upstream request is `POST https://api.bingr.one/api/stream`.
- `useHlsPlayer` remains the playback layer and `/api/proxy` remains the media proxy.

### Player UI / interaction status
- `BingrWatch.tsx` follows the supplied bingr.one mobile layout: title/back at top-left, Quality and Audio & Subtitles at top-right, server pill above the seekbar, More Like This above the transport controls, and bottom transport controls.
- Quality profile selection is wired to source selection and preserves playback position.
- Server 1/2 and the full server list are wired to `useBingrSources` and preserve playback position.
- Rewind/forward 10s use the double-chevron transport icons matching the reference.
- Play/pause, seekbar, volume/mute and back/report interactions are wired.
- Fullscreen requests the player root with browser UI hidden where supported, then requests a landscape orientation lock; exit unlocks the screen. Orientation locking remains browser/device dependent.
- Subtitle URLs are routed through the existing media proxy before being attached as WebVTT text tracks, and selected tracks are explicitly switched between `disabled` and `showing`.
- HLS audio-track selection is exposed by `useHlsPlayer` and the Audio menu only presents tracks actually supplied by the HLS manifest.
- Controls auto-hide after 3.2s while playback is running; overlays/menus keep them visible, and pointer movement only wakes hidden controls instead of constantly resetting the timer while visible.
- More Like This uses TMDB recommendations first, with TMDB similar titles as fallback, excludes the current title, deduplicates results, and navigates each real card through the SPA.
- Report an Issue uses the device share sheet when available, with clipboard fallback.
- Player identity now includes the Allrated logo watermark and compact Netflix-style genre metadata under the title when genre data is available.
- Added restrained player micro-animations: play/pause and ±10s feedback, menu open, More Like This open, button press/hover, and seek thumb transitions. No new feature-heavy controls were added.

### Important honesty rule
The player should never display a fake audio option when the current HLS manifest does not expose alternate audio tracks. If the manifest has no alternate tracks, the Audio panel explicitly says so.

## Latest player polish commit
- `88a9f65570c09bb1b32aea2de5c08c52a3a8f45a` — Allrated logo, genre metadata, restrained animations and player identity polish.

### Verification still required
- Deploy `main` to Vercel.
- Verify `POST /api/bingr/stream` is HTTP 200 and contains `sources` and `subtitles`.
- Verify `GET /api/catalog/title/movie/969681/similar` (and TV equivalent) returns the intended recommendation data.
- Runtime QA on mobile and desktop against the supplied bingr.one screenshots.
- Confirm fullscreen rotation, subtitle rendering, transport icons, More Like This relevance, logo/genre placement, animation timing, and control auto-hide after deployment.
- Do not claim pixel-perfect/runtime parity until visually checked.

## Token
Repo: `somilkhan/Movietalk`
Use GitHub API with the stored token. NEVER expose it.
