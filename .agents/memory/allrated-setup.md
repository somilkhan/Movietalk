---
name: allrated setup
description: How the allrated Bingr clone is structured, configured, and started on Replit.
---

# allrated — Bingr Clone Setup

## Stack
- **Frontend**: `artifacts/allrated` — React + Vite + TailwindCSS v4, wouter routing, TanStack Query
- **API server**: `artifacts/api-server` — Express v5 + Drizzle ORM (PostgreSQL), proxies TMDB and CinePro Core
- **Stream engine**: `artifacts/cinepro-core` — OMSS-compliant scraping engine with 17 providers, listens on port 3001

## Environment
- `TMDB_API_KEY` — required in `shared` env vars (set via setEnvVars, not a secret)
- `DATABASE_URL` — auto-managed by Replit PostgreSQL
- DB schema pushed with `cd lib/db && pnpm run push`

## Design system (Bingr exact values)
- Background: `#07070b` (CSS var: `--background: 240 22% 3.5%`)
- Card bg: `#252830`
- Primary accent: `#4752c4` (CSS var: `--primary: 234 53% 52%`)
- Accent red: `#ff2357` (danger/live)
- Text: `#e9e9ee`

**Why:** Matches bingr.one's exact design tokens from RESEARCH.md in clone-data/.

## Sidebar
- Fixed 60px width, icon-only, no hover-expand
- Active indicator: 3px left bar in `#4752c4`
- Tooltips appear on hover via `group-hover`

**Why:** bingr.one uses fixed 60px icon sidebar, not expandable.

## Running order
1. `artifacts/api-server: API Server` — must be up first (port 8080)
2. `CinePro Core` — streaming engine on port 3001
3. `artifacts/allrated: web` — frontend proxies /api to 8080

## Research data
- `clone-data/bingr-one-observations.md` — full pixel-perfect spec from bingr.one
- `clone-data/screenshots/` — reference screenshots of target site
