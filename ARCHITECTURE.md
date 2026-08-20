# RabbitRip Architecture

## System overview

RabbitRip is a pnpm workspace whose production application is deployed on Vercel.

```text
Browser
  │
  ▼
Vercel
  ├── React/Vite web application
  └── /api/* Vercel Functions
        │
        ├── Supabase Auth integration
        ├── Neon/PostgreSQL data access
        ├── TMDB catalog/poster data
        └── external streaming/player providers
```

Vercel environment variables are the runtime configuration source for production. Secrets and provider credentials must never be committed to the repository.

## External services

### Supabase — authentication

Supabase is RabbitRip's authentication provider. The frontend integrates with Supabase Auth for email/password authentication and OAuth providers such as Google and GitHub.

Relevant client configuration is supplied through Vercel environment variables, including the Supabase URL and publishable key. Authentication sessions are handled by the application's auth layer; do not introduce a second authentication system without an explicit architecture decision.

### Neon — database

Neon provides the PostgreSQL database used by RabbitRip. The repository accesses it through the database package in `lib/db/` using the `DATABASE_URL` environment variable.

Database responsibilities include application state such as user-related data, watch history/progress, watchlists, ratings, and other persisted application data defined by the current schema.

### TMDB — catalog and poster metadata

TMDB supplies movie/TV metadata and poster/catalog information used by RabbitRip. TMDB credentials are environment configuration and must remain server-side where the API requires a secret.

Do not treat TMDB as the source of video playback. It provides metadata/catalog information, not RabbitRip's streaming player implementation.

### External streaming APIs/providers — playback

RabbitRip's playback/streaming data comes from external provider APIs. These providers are separate from TMDB and from authentication/database infrastructure.

For example, the current Bingr function proxies requests to the Bingr streaming API. The browser should use RabbitRip's controlled API surface rather than embedding provider-specific credentials or assumptions throughout UI components.

Do not merge the streaming provider layer with TMDB catalog logic merely because both are used by the watch experience.

## Primary web package

`artifacts/allrated/` is the primary RabbitRip application despite its historical `artifacts/` directory name.

It contains:

- React UI and routing
- client-side data hooks
- HLS playback integration
- Vercel function entry points
- Vite configuration
- Vercel deployment configuration

Its package name is `@workspace/rabbitrip`.

## API boundaries

The repository contains more than one server/API surface. Treat them as separate owners until code tracing proves otherwise.

### Vercel application functions

`artifacts/allrated/api/` contains functions associated with the production web deployment. `artifacts/allrated/vercel.json` defines the production API routing and frontend fallback behavior.

Notable paths include:

- `/api/bingr/stream`
- `/api/bingr/download`
- `/api/catalog/title/:mediaType/:id/similar`
- `/api/catalog/genre`
- `/api/catalog/anilist`
- `/api/progress`
- the general `/api/*` fallback

### Express server package

`artifacts/api-server/` is a separate Express package. Do not assume it owns the same production routes as the Vercel functions. Verify deployment configuration and callers before changing or removing it.

### CinePro

`artifacts/cinepro-core/` is a separate service/core. Existing architecture keeps Bingr and CinePro separate. Do not route Bingr requests through CinePro merely to simplify the architecture.

## Shared packages

`lib/` contains reusable workspace packages such as API clients, Zod/API definitions, database access, and integrations. Shared logic belongs here only when it is genuinely shared; application-specific behavior should remain in its owning package.

## Configuration ownership

- Root `package.json` — workspace-level commands and toolchain.
- `pnpm-workspace.yaml` — workspace packages and dependency catalogs.
- `artifacts/allrated/package.json` — primary frontend package dependencies/scripts.
- `artifacts/allrated/vite.config.ts` — frontend build/development configuration.
- `artifacts/allrated/vercel.json` — production Vercel routing/build configuration.
- Vercel environment variables — production credentials and provider configuration.

## Important invariants

1. Vercel is the production deployment platform.
2. Supabase is the authentication provider.
3. Neon is the PostgreSQL database provider.
4. TMDB supplies catalog/poster metadata, not playback.
5. External streaming APIs/providers supply playback data.
6. Replit is not supported and must not be reintroduced.
7. Bingr and CinePro remain separate systems.
8. Existing API contracts should be preserved unless intentionally changed.
9. Secrets remain outside Git and are supplied through environment variables.
10. Duplicate API implementations must not be created without an explicit ownership decision.

## Architecture changes

When changing a boundary, update this document and add a decision record under `docs/decisions/` when the change is durable or affects multiple packages.
