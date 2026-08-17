# RabbitRip

RabbitRip is a web application for browsing and watching movies and TV content, with catalog, watch-history, recommendation, authentication, and streaming functionality.

## Production

RabbitRip is deployed on Vercel.

- Production: https://rabbitrip.vercel.app
- Repository: https://github.com/somilkhan/RabbitRip

Replit is not part of the project workflow.

## Production services

| Responsibility | Service |
|---|---|
| Hosting / deployment / environment variables | Vercel |
| Authentication | Supabase Auth |
| PostgreSQL database | Neon |
| Movie/TV metadata and posters | TMDB |
| Video/streaming player data | External streaming APIs/providers |

Provider credentials and secrets are configured in Vercel environment variables and must not be committed to Git.

## Repository map

```text
artifacts/allrated/     Primary web application + Vercel API functions
artifacts/api-server/   Separate Express server package
artifacts/cinepro-core/ Separate CinePro service/core
lib/                    Shared workspace packages
api/                    Root-level serverless code; verify ownership before extending
clone-data/             Reference/research material
scripts/                Repository tooling
```

## Architecture

The primary production application lives in `artifacts/allrated/`. Its Vite build produces the web client, while its `api/` directory contains Vercel function entry points used by the deployed application.

Supabase handles authentication, Neon provides PostgreSQL persistence, TMDB provides catalog/poster metadata, and external streaming providers supply playback data. These responsibilities are intentionally separate.

Read [`ARCHITECTURE.md`](ARCHITECTURE.md) before making cross-package or integration changes.

## Working with coding agents

Start with [`AGENTS.md`](AGENTS.md). It defines repository rules, ownership, validation workflow, and safety constraints for ChatGPT, Kimi, and other coding agents.

## Development

See [`DEVELOPMENT.md`](DEVELOPMENT.md) for setup and validation commands.

## API

See [`docs/API.md`](docs/API.md) for the current API surface and ownership model.
