---
name: Solutions Log
description: Record of fixes, workarounds, and solutions found so agents don't repeat research.
---

# Solutions Log

## Format
```
## [Date] — [Issue Title]
**File:** `path/to/file`
**Problem:** One-line description
**Solution:** What was changed
**Verified:** Yes/No
```

---

## 2026-08-05 — Scrolling blocked by Row wheel handler
**File:** `artifacts/allrated/src/components/Row.tsx`
**Problem:** `handleWheel` calls `e.preventDefault()` on vertical scroll, trapping the page when finger is over a row.
**Solution:** Remove the `handleWheel` function and the `onWheel={handleWheel}` prop from the scroller div. Change `snap-mandatory` to `snap-proximity`.
**Verified:** No — pending implementation

## 2026-08-05 — Broken homepage category rows
**File:** `artifacts/allrated/src/pages/Home.tsx`
**Problem:** Studios, Popular Genres, Popular Languages rows use images from `https://api.bingr.one/static/categories/...` which 404 for external users.
**Solution:** Remove these three `<CategoryRow>` instances from Home.tsx. They show empty gray boxes.
**Verified:** No — pending implementation

## 2026-08-05 — Mobile nav wrong tabs
**File:** `artifacts/allrated/src/components/MobileNav.tsx`
**Problem:** Only 4 tabs (Home, Search, My Space, Categories). Missing TV, Watchlist, Sports.
**Solution:** Replace with 5-6 tabs: Home, Search, TV, Watchlist, Sports, Categories. Add active state indicator (dot or color change). Use Lucide icons matching bingr.one sidebar.
**Verified:** No — pending implementation

## 2026-08-05 — Hero too tall on mobile
**File:** `artifacts/allrated/src/components/HeroBanner.tsx`
**Problem:** `h-[75vh]` with `clamp(2.5rem, ...)` title overwhelms phone screens.
**Solution:** Change to `h-[55vh] sm:h-[60vh]` and reduce min font size to `clamp(1.5rem, 4vw, 5rem)`.
**Verified:** No — pending implementation

## 2026-08-05 — Footer visible on mobile
**File:** `artifacts/allrated/src/components/Footer.tsx`
**Problem:** Footer renders on mobile taking unnecessary space.
**Solution:** Add `hidden md:block` to the footer wrapper.
**Verified:** No — pending implementation
