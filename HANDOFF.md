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

## Current Status — DETAIL PAGE IN PROGRESS

### ✅ Completed (do NOT redo)
- Mobile nav (7 tabs, icon-only circles, bingr SVGs)
- ContentTray (bingr header styling, pill View All)
- TitleCard (ring, hover, metadata)
- NumberedTitleCard (Alfa Slab One gradient numbers)
- **Detail page hero**: full viewport video background, title/logo stays visible, metadata fades when trailer plays
- **Detail page action buttons**: Play (white circle), Watchlist (+), Download (movies only), Mute, Pause
- **Metadata format**: • dot separators, `2h 25m` runtime, certification (TV-MA/PG-13)
- **Genres**: pipe-separated text links
- **Removed**: YOUR RATING section, Trailer embed section
- **Cast**: horizontal scroll row with circular photos
- **Episodes section**: season picker, search, episode list with thumbnails (TV only)
- **Keep Bingring**: landscape grid cards with rating badge + hover play button
- **Backend**: certification fetching from TMDB (release_dates/content_ratings)

### 🔄 In Progress / Known Issues
- Detail page may need fine-tuning after deploy
- Desktop sidebar — verify it matches bingr.one hover-expand
- Home page hero — verify video background works
- Watch page — not started
- Explore/Search pages — not started

### 📋 Next Tasks (pick one)
1. **Deploy and test detail page** — check all changes render correctly
2. **Fix any detail page bugs** — user will screenshot issues
3. **Home page** — match bingr.one hero styling
4. **Watch page** — build the player page
5. **Desktop sidebar** — verify/update to match bingr.one

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
