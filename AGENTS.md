# RabbitRip — Agent Engineering Guide

## Purpose

RabbitRip is a Vercel-deployed web application. This repository is the source of truth for the application code, configuration, API contracts, and engineering documentation.

Supported development workflow:

- GitHub repository
- ChatGPT / Kimi / other coding agents
- Vercel for production deployment

**Replit is not a supported development, deployment, or runtime environment. Do not add Replit-specific tooling or configuration.**

## Before editing

1. Read this file.
2. Read `ARCHITECTURE.md` for system boundaries.
3. Identify the owning package or API surface before changing code.
4. Search for existing implementations before creating a new one.
5. Preserve existing public routes and API contracts unless the task explicitly changes them.
6. Prefer the smallest coherent change over broad rewrites.

## Repository boundaries

- `artifacts/allrated/` — primary RabbitRip web application and its Vercel functions.
- `artifacts/api-server/` — separate Express server package used by the workspace/development architecture.
- `artifacts/cinepro-core/` — separate CinePro service/core. Do not silently merge it into the RabbitRip/Bingr request path.
- `lib/` — shared workspace packages.
- `api/` — root-level serverless code whose production ownership must be verified before extending or duplicating it.
- `clone-data/` — reference/research material, not runtime application logic.

## Rules

1. Never commit secrets, API keys, tokens, cookies, or private credentials.
2. Never expose environment secrets in documentation or client-side code.
3. Do not introduce Replit dependencies, plugins, workflows, or configuration.
4. Do not create duplicate API implementations when an existing route already owns the behavior.
5. Keep Bingr and CinePro as separate systems unless an explicit architectural change is requested.
6. Do not move large directories merely to make names look cleaner; prove ownership and dependency relationships first.
7. Do not delete runtime code solely because it looks old. Confirm references and deployment ownership first.
8. Update documentation when architecture, API ownership, environment requirements, or developer workflow changes.

## Change workflow

```text
READ → TRACE → PLAN → EDIT → VALIDATE → REVIEW DIFF → DOCUMENT
```

### Validation

At minimum, run the checks appropriate to the affected package:

- frontend typecheck
- frontend build
- API/server typecheck or build
- focused runtime verification for changed endpoints

Do not claim production correctness from static inspection alone.

## Dependency changes

When adding or removing a dependency:

1. Verify it is actually required.
2. Update the owning `package.json`.
3. Regenerate/update `pnpm-lock.yaml` with pnpm.
4. Run the relevant build/typecheck.
5. Confirm no stale references remain.

## Documentation ownership

- `README.md` — what RabbitRip is and how to orient yourself.
- `ARCHITECTURE.md` — system structure and runtime boundaries.
- `DEVELOPMENT.md` — local development and validation.
- `docs/API.md` — API ownership and contracts.
- `docs/decisions/` — durable architectural decisions.

Git history is the historical record. Do not create session-memory files that pretend to be current architecture.
