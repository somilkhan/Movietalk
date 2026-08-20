# RabbitRip — Agent Engineering Guide

## Purpose

RabbitRip is a Vercel-deployed web application. This repository is the source of truth for application code, configuration, API contracts, and engineering documentation.

Supported workflow:

- GitHub repository
- ChatGPT / Kimi / other coding agents
- Vercel for production deployment

**Replit is not supported. Do not add Replit tooling, configuration, dependencies, or deployment assumptions.**

## Production architecture

```text
Browser
  |
  v
Vercel
  +-- React/Vite frontend
  +-- /api/* serverless functions
  |
  +--> Supabase Auth       identity, sessions, OAuth
  +--> Neon/PostgreSQL     application persistence
  +--> TMDB                movie/TV metadata and posters
  +--> External streaming APIs/providers
                              playback/stream data
```

### Service boundaries

| Responsibility | Owner |
|---|---|
| Hosting, deployment, runtime configuration | Vercel |
| Authentication, OAuth, user identity | Supabase Auth |
| Application PostgreSQL data | Neon/PostgreSQL |
| Movie/TV metadata and posters | TMDB |
| Video/streaming data | External streaming APIs/providers |
| Browser UI | `artifacts/allrated/` |

These boundaries are architectural invariants. Do not move authentication into the application database, treat TMDB as a streaming provider, or make a streaming provider the catalog source.

## Repository boundaries

- `artifacts/allrated/` — primary RabbitRip web application and Vercel functions.
- `artifacts/api-server/` — separate Express server package; verify deployment ownership before changing or removing it.
- `artifacts/cinepro-core/` — separate CinePro service/core. Do not silently merge it into the RabbitRip/Bingr request path.
- `lib/` — shared workspace packages, including database/API packages.
- `api/` — serverless code whose production ownership must be verified before extending, duplicating, or deleting it.
- `scripts/` — repository tooling.
- `docs/` — canonical engineering documentation and architectural decisions.

## Legacy surfaces

`artifacts/allrated/api/index.js` is a legacy monolithic API surface. It contains older authentication/session logic and other routes that are not equivalent to the current Supabase/Neon architecture.

**Do not delete it merely because it is old.** Inventory its routes, trace callers, verify Vercel routing, and migrate any still-used functionality before removing it. The `/api` catch-all must remain until those live routes are migrated and verified.

`artifacts/cinepro-core/` is also not automatically part of the current streaming path. Keep it separate until deployment and caller evidence supports a deliberate migration.

## Agent workflow

```text
READ → TRACE → PLAN → EDIT → TEST → VERIFY → DOCUMENT → DIFF → COMMIT
```

### Before editing

1. Read this file and the relevant architecture/API documentation.
2. Identify the owning package or API surface.
3. Search for callers and duplicate implementations.
4. Check Vercel routing/deployment ownership for API changes.
5. Determine whether the target is production code, legacy code, tooling, or historical material.
6. Preserve public routes/contracts unless the task intentionally includes a migration.

### After editing

- Inspect the complete diff.
- Run the narrowest useful validation first.
- Run affected package typecheck/build when practical.
- Verify changed API routes and deployment configuration.
- Update canonical documentation when behavior, ownership, or workflow changes.

## Engineering rules

1. Code plus canonical documentation is the source of truth.
2. Never commit secrets, API keys, tokens, cookies, or private credentials.
3. Treat Vercel environment variables as production configuration; never copy real values into Git or docs.
4. Do not introduce duplicate API/business logic.
5. Prefer existing workspace utilities and dependencies over unnecessary new packages.
6. Keep business logic out of presentational React components when a service/module boundary exists.
7. Do not delete runtime code solely because it looks old; prove references and deployment ownership first.
8. Do not make broad rewrites when a smaller coherent change is sufficient.
9. Keep Supabase Auth, Neon persistence, TMDB metadata, and streaming-provider responsibilities separate.
10. Keep Bingr and CinePro separate unless an explicit architectural decision changes that boundary.
11. Do not create session-status, handoff, or agent-memory files as a substitute for canonical docs.

## Dependencies and lockfile

RabbitRip is a pnpm workspace. When adding/removing dependencies:

1. Update the owning `package.json` or workspace catalog.
2. Regenerate `pnpm-lock.yaml` with the repository-compatible pnpm version.
3. Run the relevant typecheck/build.
4. Confirm stale dependency references are gone.

Never hand-edit package resolution data when package-manager regeneration is available.

## Environment variables

Production provider configuration belongs in Vercel environment variables.

Known integration categories include:

- Supabase URL and publishable key for frontend authentication.
- Neon `DATABASE_URL` for PostgreSQL access.
- TMDB credentials for server-side catalog access where required.
- Streaming-provider configuration/credentials where required.

Never place real values in source control, documentation, or `.env.example`.

## Documentation ownership

- `README.md` — project purpose and orientation.
- `ARCHITECTURE.md` — system structure, service boundaries, and data flow.
- `DEVELOPMENT.md` — local development, build, and validation workflow.
- `docs/API.md` — API surfaces, ownership, and contracts.
- `docs/decisions/` — durable architectural decisions.

Git history is the historical record. Do not recreate historical state as current architecture.

## Definition of done

A change is complete only when, as applicable:

- source is internally consistent;
- dependencies and lockfile are synchronized;
- typecheck/build passes;
- Vercel routing still matches intended API ownership;
- no obsolete platform configuration was introduced;
- affected documentation is accurate;
- the final diff contains only intentional changes.
