# bingr.one Target Audit

> Recon status: COMPLETE — DOM extracted via DevTools
> Date: 2026-08-12

## Homepage
- [x] Hero banner — NOT present on homepage (landing page has "TAP TO ENTER", then straight to rows)
- [x] Floating nav — bottom pill, 7 items, icon-only circles, bg-[#0f1014]/90 backdrop-blur-md
- [x] Content rows — horizontal scroll, gap-3, px-6 lg:px-20
- [x] Title cards — w-[130/160/185px], aspect-[2/3], ring-1 ring-white/5, hover -translate-y-2 ring-white/20
- [x] Card metadata — title below (14px semibold), rating · year · type (11px white/50)
- [x] Numbered cards — MASSIVE Alfa Slab One numbers (100-140px) left of card, gradient text
- [x] Row headers — text-[17px] lg:text-[19px] font-semibold text-white/90 + pill "View All" button
- [x] Footer — not visible in recon

## Navigation
- [x] Mobile bottom nav — 7 items: Home, Search, TV, Anime, Movies, Categories, Space
- [x] Desktop sidebar — 80px fixed left, 9 items, hover expand to 350-450px, gradient bg
- [x] Logo — /brand/logo.png 55px mobile, 60px desktop
- [x] Scroll-to-top — fixed bottom-[90px], circular progress ring

## Detail Page
- [ ] Backdrop image
- [ ] Title + metadata
- [ ] Play / Trailer buttons
- [ ] Cast carousel
- [ ] Similar titles

## Watch Page
- [ ] Video player
- [ ] Episode list
- [ ] Source selector

## Auth
- [x] Login modal — exists (LoginDialog.tsx)
- [ ] Watchlist — exists but needs UI verification
- [ ] Continue watching — exists but needs UI verification

## Recon Notes
### Colors
- bg: black (#000000 main), #0f1014 (theme-color), #1a1a1a (nav circles), #1a1c24 (card bg)
- text: white/90 (headings), white/60 (inactive), white/50 (metadata)
- accent: white/10 (hover bg), white/5 (subtle borders)

### Fonts
- Headings: Inter (semibold 17-19px)
- Numbers: Alfa Slab One (100-140px)
- Body: Inter (14px semibold titles, 11px medium metadata, 12px semibold buttons)

### Key Differences from Our Current Build
1. ✅ TitleCard — MATCHES (ring, hover, metadata row)
2. ✅ NumberedTitleCard — MATCHES (gradient Alfa Slab One numbers)
3. ✅ MobileBottomNav — MATCHES (icon-only circles, 7 tabs)
4. ✅ ContentTray header — MATCHES (17px semibold, pill View All)
5. ❓ DesktopSidebar — NEEDS VERIFICATION (hover expand, 9 items)
6. ❓ HeroBanner — NOT USED on homepage (landing page only?)
7. ❓ Detail page — NOT RECONNED
