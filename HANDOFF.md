# Project Handoff — Allrated (Bingr.one Clone)

> **AGENT WORKFLOW — READ THIS FIRST**
>
> You have a **25-call limit per session**. When you reach **~20-22 calls used**, you MUST:
> 1. Update this HANDOFF.md with your progress
> 2. Update `.agents/memory/SESSION_STATUS.md` with what you completed
> 3. Commit and push to GitHub
> 4. Tell the user: "I've used X calls. Say **'continue'** to give me 25 more calls."
>
> When the user says **"continue"**, read HANDOFF.md first to pick up where the last agent left off.
>
> **NEVER** start coding without reading HANDOFF.md and `.agents/memory/SESSION_STATUS.md` first.

---

## What this project is

A pixel-perfect clone of **bingr.one**, a dark-themed streaming site for movies, TV shows, and anime. Built as a full-stack monorepo.

## Three services — all must be running

| Workflow name | Directory | Port | Purpose |
|---|---|---|---|
| `artifacts/allrated: web` | `artifacts/allrated` | 5173 | React/Vite frontend |
| `artifacts/api-server: API Server` | `artifacts/api-server` | 8080 | Express REST API (TMDB proxy, ratings, watchlist) |
| `CinePro Core` | `artifacts/cinepro-core` | 3001 | Streaming engine (17 providers, HLS scraping) |

The frontend proxies `/api/*` → `localhost:8080` via Vite dev server config.

## Required environment variables

| Variable | Type | Where set | Used by |
|---|---|---|---|
| `TMDB_API_KEY` | Shared env var | Replit env panel | API server — all catalog/metadata |
| `SESSION_SECRET` | Secret | Replit secrets | API server — session signing |
| `DATABASE_URL` | Auto-managed | Replit PostgreSQL | API server + `lib/db` |

> To set/view env vars: use Replit's Secrets panel or run `printenv TMDB_API_KEY` to confirm it's set.

## Database

- Provider: Replit built-in PostgreSQL (auto-connected via `DATABASE_URL`)
- ORM: Drizzle (`lib/db/src/schema/`)
- **If tables are missing** (ratings/watchlist 500 errors): `cd lib/db && pnpm run push`

## Design system (matches bingr.one exactly)

| Token | Value |
|---|---|
| Background | `#07070b` |
| Card background | `#252830` |
| Primary accent (blue) | `#4752c4` |
| Danger/live accent | `#ff2357` |
| Text | `#e9e9ee` |

Full pixel spec: `clone-data/bingr-one-observations.md`  
Reference screenshots: `clone-data/screenshots/`

## Monorepo structure

```
artifacts/
  allrated/          ← React frontend (Vite, Tailwind v4, TanStack Query, Wouter)
  api-server/        ← Express 5 backend
  cinepro-core/      ← Streaming scraping engine (third-party, do not modify heavily)
  mockup-sandbox/    ← Design preview server (Vite, for UI prototyping only)
lib/
  db/                ← Drizzle ORM schema + client
  api-zod/           ← Zod schemas for API types
  api-spec/          ← OpenAPI spec (Orval codegen source)
  api-client-react/  ← Generated TanStack Query hooks (run `pnpm --filter @workspace/api-client-react run generate` to regenerate)
```

## Key files to know

| File | What it does |
|---|---|
| `artifacts/allrated/src/App.tsx` | Router + layout shell |
| `artifacts/allrated/src/components/Sidebar.tsx` | Fixed 60px icon sidebar |
| `artifacts/allrated/src/pages/Home.tsx` | Hero + content rows |
| `artifacts/allrated/src/pages/TitleDetail.tsx` | Movie/TV detail page |
| `artifacts/allrated/src/pages/Watch.tsx` | Video player + stream resolver |
| `artifacts/api-server/src/routes/catalog/index.ts` | TMDB proxy routes |
| `artifacts/api-server/src/routes/watchlist.ts` | Watchlist CRUD |
| `artifacts/api-server/src/routes/ratings.ts` | Ratings CRUD |
| `artifacts/cinepro-core/src/server.ts` | CinePro entry point |

## AGENT RULES (MANDATORY — DO NOT BREAK)

1. **READ BEFORE WRITE** — Always read HANDOFF.md and `.agents/memory/SESSION_STATUS.md` before doing anything.
2. **NO GUESSING** — If you don't know how something works, read the code. Never assume. Never hallucinate file paths.
3. **ONE FIX AT A TIME** — Apply one fix, verify it, commit it. Don't batch 10 changes and hope they work.
4. **TEST ON MOBILE VIEWPORT** — After every UI change, mentally verify it works on 375px width. The target is mobile-first.
5. **NEVER MODIFY CINEPRO-CORE** — The streaming engine is third-party. Don't touch it.
6. **NEVER DELETE WORKING CODE** — If something works, preserve it. Comment out, don't delete, until confirmed broken.
7. **RECORD SOLUTIONS** — When you find a fix, add it to `.agents/memory/SOLUTIONS_LOG.md` so the next agent doesn't repeat your research.
8. **UPDATE SESSION STATUS** — After every fix, update `.agents/memory/SESSION_STATUS.md` with what you did and what's next.
9. **COMMIT AT 20 CALLS** — At call ~20, commit everything, update handoff, and ask user to say "continue".
10. **NO INFINITE LOOPS** — If you're going in circles on the same file, stop. Record the blocker and move to the next task.

---

## CURRENT STATUS

**All 10 mobile fixes COMPLETE ✅** (Commit 33d9d07 on main)

### Mobile Fix Checklist — ALL DONE

| # | Issue | File | Status |
|---|-------|------|--------|
| 1 | Remove broken Popular Genres, Languages, Studios rows from Home | `Home.tsx` | ✅ DONE |
| 2 | Fix Row.tsx wheel handler blocking vertical scroll | `Row.tsx` | ✅ DONE |
| 3 | Fix mobile nav — 6 tabs with active state | `MobileNav.tsx` | ✅ DONE |
| 4 | Reduce hero height + title size on mobile | `HeroBanner.tsx` | ✅ DONE |
| 5 | Hide footer on mobile | `Footer.tsx` | ✅ DONE |
| 6 | Fix title detail hero + back button overlap | `TitleDetail.tsx` | ✅ DONE |
| 7 | Fix explore grid to 2 columns on mobile | `Explore.tsx` | ✅ DONE |
| 8 | Fix inconsistent bottom padding across pages | Multiple | ✅ DONE |
| 9 | Fix double headers (MobileHeader + page back buttons) | `App.tsx` | ✅ DONE |
| 10 | Fix Sparks page height conflict with bottom nav | `Sparks.tsx` | ✅ DONE |

### Next Phase — Pick one:

1. **Hero logo image** — hero shows text title; should show TMDB logo PNG (`/movie/:id/images` endpoint, `logo_path` field, `w500` size)
2. **Cast headshots** — detail page is missing the circular cast photo row (data available via `/api/catalog/title/:type/:id/credits`)
3. **Watchlist persistence** — end-to-end test that sessionId survives page refresh and saves persist
4. **Deploy** — build and deploy frontend to test mobile fixes live

---

---

## What's working

- ✅ Home page: hero, trending rows, content carousels — all real TMDB data
- ✅ Detail page: backdrop hero, metadata, trailer embed
- ✅ Watch page: CinePro Core resolves streams from 17 providers
- ✅ Ratings + watchlist: database tables created, endpoints live
- ⚠️ Mobile layout: bottom nav exists but wrong tabs, scrolling broken, hero too tall

## Known gaps / next things to build

1. **Hero logo image** — hero shows text title; should show TMDB logo PNG (`/movie/:id/images` endpoint, `logo_path` field, `w500` size)
2. **Cast headshots** — detail page is missing the circular cast photo row (data available via `/api/catalog/title/:type/:id/credits`)
3. **Watchlist persistence** — end-to-end test that sessionId survives page refresh and saves persist
