# RabbitRip Architecture

## System overview

RabbitRip is a pnpm workspace containing a primary Vite/React web application, server packages, shared libraries, and serverless API code.

Production is Vercel-based. The production deployment configuration currently lives with the primary application in `artifacts/allrated/vercel.json`.

```text
Browser
  │
  ▼
Vercel-hosted RabbitRip web app
  │
  ├── React/Vite UI
  │
  └── /api/* Vercel Functions
        │
        ├── catalog integrations
        ├── Bingr streaming/download paths
        ├── progress/history paths
        └── other application API handlers
```

## Primary web package

`artifacts/allrated/` is the primary application package despite its historical `artifacts/` directory name.

It contains:

- React UI and routing
- client-side data hooks
- HLS playback integration
- Vercel function entry points
- Vite configuration
- Vercel deployment configuration

Its package name is `@workspace/rabbitrip`.

## API boundaries

The repository currently has more than one server/API surface. They must be treated as separate owners until code tracing proves otherwise:

### Vercel application functions

`artifacts/allrated/api/` contains functions associated with the production web deployment. `artifacts/allrated/vercel.json` explicitly maps the production API routes and frontend fallback behavior.

Notable paths include:

- `/api/bingr/stream`
- `/api/bingr/download`
- `/api/catalog/title/:mediaType/:id/similar`
- `/api/catalog/genre`
- `/api/catalog/anilist`
- `/api/progress`
- the general `/api/*` fallback

### Express server package

`artifacts/api-server/` is a separate Express package. It should not be assumed to own the same production routes as the Vercel functions.

### CinePro

`artifacts/cinepro-core/` is a separate service/core. Existing project constraints keep Bingr and CinePro separate. Do not route Bingr requests through CinePro merely to simplify the architecture.

## Shared packages

`lib/` contains reusable workspace packages such as API clients, Zod/API definitions, database access, and integrations. Shared logic belongs here only when it is genuinely shared; application-specific behavior should remain in its owning package.

## Configuration ownership

- Root `package.json` — workspace-level commands and toolchain.
- `pnpm-workspace.yaml` — workspace packages, dependency catalogs, and platform overrides.
- `artifacts/allrated/package.json` — primary frontend package dependencies/scripts.
- `artifacts/allrated/vite.config.ts` — frontend build/development configuration.
- `artifacts/allrated/vercel.json` — production Vercel routing/build configuration.

## Important invariants

1. Vercel is the production deployment platform.
2. Replit is not supported and must not be reintroduced.
3. Bingr and CinePro remain separate systems.
4. Existing API contracts should be preserved unless intentionally changed.
5. Secrets remain server-side and are supplied through environment variables.
6. Duplicate API implementations must not be created without an explicit ownership decision.

## Architecture changes

When changing a boundary, update this document and add a decision record under `docs/decisions/` when the change is durable or affects multiple packages.
