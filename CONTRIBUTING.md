# Contributing to RabbitRip

## Before you change code

1. Read `AGENTS.md`.
2. Read `ARCHITECTURE.md` for changes crossing service boundaries.
3. Read `docs/API.md` before changing API routes.
4. Search for existing implementations and callers.
5. Check Vercel routing when changing serverless/API code.

## Implementation principles

- Make the smallest coherent change.
- Preserve public API contracts unless a migration is intentional.
- Keep Supabase Auth, Neon, TMDB, and streaming-provider responsibilities separate.
- Reuse existing shared packages before adding dependencies.
- Keep secrets out of Git.
- Do not add Replit tooling or configuration.
- Do not delete legacy runtime code until its callers and deployment ownership are understood.

## Validation

Use the repository's pnpm version/tooling. At minimum, validate the affected package; for cross-cutting changes also run the workspace typecheck/build.

Typical checks:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
```

For API changes, additionally verify the affected route and its Vercel routing configuration.

## Documentation

Update canonical documentation in the same change when you alter:

- architecture or service boundaries;
- API ownership or response contracts;
- environment-variable requirements;
- build/deployment workflow;
- security assumptions.

Use `docs/decisions/` for durable architecture decisions.

## Commit hygiene

Commits should describe the actual change and avoid mixing unrelated refactors. Before committing, inspect `git diff` and confirm generated files or local context dumps are not accidentally included.
