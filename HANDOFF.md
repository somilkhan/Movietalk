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

## Current Status — WATCH PAGE IN PROGRESS

### ✅ Completed (do NOT redo)
- Mobile nav (7 tabs, icon-only circles, bingr SVGs)
- ContentTray (bingr header styling, pill View All)
- TitleCard (ring, hover, metadata)
- **Detail page hero**: full viewport video background, title/logo stays visible, metadata fades when trailer plays
- **Detail page action buttons**: Play (white circle), Watchlist (+), Download (movies only), Mute, Pause
- **Metadata format**: • dot separators, `2h 25m` runtime, certification (TV-MA/PG-13)
- **Genres**: pipe-separated text links
- **Removed**: YOUR RATING section, Trailer embed section
- **Cast**: horizontal scroll row with circular photos
- **Episodes section**: season picker, search, episode list with thumbnails (TV only)
- **Keep Bingring**: landscape grid cards with rating badge + hover play button
- **Backend**: certification fetching from TMDB (release_dates/content_ratings)
- Existing working Bingr extraction path via `useBingrSources` + `useHlsPlayer`
- New Bingr-style watch player shell: `artifacts/allrated/src/pages/BingrWatch.tsx`
- `/watch/:mediaType/:id` routed to new player from `App.tsx`
- Quality/server popover UI, Audio & Subtitles popover UI, seek controls, fullscreen, volume, subtitle track toggling, More Like This overlay

### 🔄 In Progress / Known Issues
- Watch player needs runtime visual QA against the supplied Bingr screenshots on mobile and desktop
- Audio selection is currently UI/state only unless the active extracted source exposes separate selectable audio tracks
- More Like This uses available `similar`/`recommendations` data when present and needs screenshot-level spacing verification

## Next Tasks
1. Runtime QA of `/watch/:mediaType/:id` with a known working extracted stream
2. Fine-tune exact desktop/mobile spacing, gradients, icons, and menu positioning against provided Bingr DOM/screenshots
3. Verify quality profile switching selects the correct available source without breaking playback
4. Wire genuine audio-track switching when source metadata supports it

## Token
Repo: `somilkhan/Movietalk`
Use GitHub API with the stored token. NEVER expose it.

## How to Commit
```bash
# Via GitHub API (Python)
import base64, json, urllib.request
token = "..."  # from memory
repo = "somilkhan/Movietalk"
# PUT to https://api.github.com/repos/{repo}/contents/{path}
```
