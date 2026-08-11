# QUICK RESUME — Bingr Clone

## Now
Phase: LIQUID_GLASS_UI + CONTENT_TRAY_POLISH
Branch: main | Last Commit: 37e68ba | Dirty: NO

## What We Are Building
Pixel-perfect bingr.one clone. ~40-50% complete.

## Current State
- Mobile nav: DONE (floating pill, blur, toast labels, swipe gestures)
- Desktop sidebar: DONE
- Hero banner: DONE (auto-rotate 7s, trailer fetch, logo overlay, filmstrip thumbs)
- Title cards: DONE (160px, numbered variant, watchlist bookmark, progress bar)
- Content rows: DONE (horizontal scroll, snap, lazy load, arrow buttons)
- Pages: Home, Movies, TV, Anime, Explore, Categories, Space, Sports, Sparks, TitleDetail, Catalog, Watch, Settings
- Auth: useAuth hook + LoginDialog
- Watch page: BackendSelector, EpisodeList, SourceSelector

## Design Tokens
- bg: #0f1014 (main), #07070b (deepest)
- card: #252830
- accent: #4752c4
- danger: #ff2357
- Font: Inter (400/500/600/700), Bebas Neue (headings)
- Tailwind v4, @import order: fonts BEFORE tailwindcss

## Session Key
allrated_session_id (NOT bingr_session)

## Build Command
pnpm -r --filter "./artifacts/allrated" run build

## Next 3 Tasks (Pick One)
1. [EASY] Audit bingr.one visual recon → fill TARGET_AUDIT.md
2. [MEDIUM] HeroBanner liquid glass overlay polish
3. [MEDIUM] TitleCard hover glass panel + expanded info

## Blockers
- NONE

## DO NOT TOUCH
- cinepro-core/
- api-server/ (unless fixing proxy)
