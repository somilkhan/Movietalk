# QUICK RESUME — Bingr Clone

## Now
Phase: BINGR_PIXEL_MATCH | Recon: 80% done, Components: 60% matched
Branch: main | Last Commit: a72ee0d | Dirty: NO

## What We Are Building
Pixel-perfect bingr.one clone. ~50-60% complete.

## Current State (MATCHES BINGR)
- Mobile nav: DONE ✅ (icon-only circles, 7 tabs, bg-[#0f1014]/90 backdrop-blur-md)
- Desktop sidebar: PARTIAL (needs hover expand + 9 items verification)
- Title cards: DONE ✅ (130/160/185px, ring-1 ring-white/5, hover -translate-y-2, metadata row)
- Numbered cards: DONE ✅ (Alfa Slab One 100-140px gradient numbers)
- Content rows: DONE ✅ (px-6 lg:px-20, gap-3, snap scroll, arrow buttons)
- Row headers: DONE ✅ (text-[17px] semibold text-white/90, pill View All)
- Pages: Home, Movies, TV, Anime, Explore, Categories, Space, Sports, Sparks, TitleDetail, Catalog, Watch, Settings
- Auth: useAuth hook + LoginDialog
- Watch page: BackendSelector, EpisodeList, SourceSelector

## Design Tokens (from bingr.one DOM)
- bg: black (#000000), #0f1014 (theme), #1a1a1a (nav circles), #1a1c24 (card bg)
- text: white/90 (headings), white/60 (inactive), white/50 (metadata)
- Font: Inter (400/500/600/700), Alfa Slab One (numbers)
- Tailwind v4, @import order: fonts BEFORE tailwindcss

## Session Key
allrated_session_id

## Build Command
pnpm -r --filter "./artifacts/allrated" run build

## Next 3 Tasks (Pick One)
1. [EASY] Screenshot bingr.one detail page → copy DOM → match our TitleDetail
2. [MEDIUM] Update DesktopSidebar → hover expand 350-450px, 9 items, gradient bg
3. [MEDIUM] Verify HeroBanner usage → is it landing page only? Remove from Home if so

## Blockers
- NONE

## DO NOT TOUCH
- cinepro-core/
- api-server/
