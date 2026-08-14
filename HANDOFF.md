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
- `BingrWatch.tsx` now follows the supplied bingr.one mobile layout: title/back at top-left, Quality and Audio & Subtitles at top-right, server pill above the seekbar, More Like This above the transport controls, and bottom transport controls.
- Quality profile selection is wired to source selection and preserves playback position.
- Server 1/2 and the full server list are wired to `useBingrSources` and preserve playback position.
- Rewind/forward 10s, play/pause, seekbar, volume/mute, fullscreen, subtitles, More Like This navigation/close, back navigation, and report interaction are wired.
- HLS audio-track selection is exposed by `useHlsPlayer` and the Audio menu only presents tracks actually supplied by the HLS manifest.
- Report an Issue uses the device share sheet when available, with clipboard fallback.
- More Like This cards use SPA navigation instead of full-page anchors.

### Important honesty rule
The player should never display a fake audio option when the current HLS manifest does not expose alternate audio tracks. If the manifest has no alternate tracks, the Audio panel explicitly says so.

### Verification still required
- Deploy `main` to Vercel.
- Verify `POST /api/bingr/stream` is HTTP 200 and contains `sources` and `subtitles`.
- Runtime QA on mobile and desktop against the supplied bingr.one screenshots.
- Confirm every player interaction after deployment; do not claim pixel-perfect/runtime parity until visually checked.

## Token
Repo: `somilkhan/Movietalk`
Use GitHub API with the stored token. NEVER expose it.
