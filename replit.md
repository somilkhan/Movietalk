# Allrated — Streaming App

A full-stack personal streaming app (movies, TV shows, anime). Three services work together:

| Service | Directory | Port | Description |
|---|---|---|---|
| Frontend | `artifacts/allrated` | 5173 | React/Vite UI with sidebar nav |
| API Server | `artifacts/api-server` | 8080 | Express + Drizzle ORM backend |
| CinePro Core | `artifacts/cinepro-core` | 3001 | OMSS streaming backend (17 providers) |

## Running

All three workflows start automatically. Use the Replit workflow panel to restart individual services:

- **`artifacts/allrated: web`** — frontend (Vite dev server)
- **`artifacts/api-server: API Server`** — backend API
- **`CinePro Core`** — streaming engine

The frontend proxies `/api` requests to the API server at `localhost:8080`.

## Required Secrets

| Secret | Where used |
|---|---|
| `TMDB_API_KEY` | API Server (catalog/metadata) + CinePro Core |
| `SESSION_SECRET` | API Server (auth sessions) |

## Database

Uses Replit's built-in PostgreSQL. Schema managed with Drizzle ORM (`lib/db`).

To push schema changes: `cd lib/db && pnpm run push`

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, TanStack Query, Wouter, Radix UI
- **API Server**: Express 5, Drizzle ORM, PostgreSQL, Pino logging
- **Streaming**: CinePro Core (OMSS-compliant, 17 stream providers)
- **Monorepo**: pnpm workspaces

## Shared Libraries

- `lib/db` — Drizzle schema + DB client
- `lib/api-zod` — Zod schemas for API request/response types
- `lib/api-client-react` — Generated React Query hooks for the frontend
- `lib/api-spec` — OpenAPI spec (Orval codegen)

## User Preferences

_No preferences recorded yet._
