# Development Guide

## Prerequisites

- Node.js compatible with the repository toolchain
- pnpm 9.x
- Git

## Install

```bash
pnpm install
```

## Frontend

The primary application is `artifacts/allrated/`.

```bash
pnpm --filter ./artifacts/allrated run dev
```

Build:

```bash
pnpm --filter ./artifacts/allrated run build
```

Typecheck:

```bash
pnpm --filter ./artifacts/allrated run typecheck
```

## Workspace validation

```bash
pnpm run typecheck
pnpm run build
```

Run the smallest relevant check first, then the workspace checks before merging a cross-package change.

## Environment

Secrets and provider credentials must be supplied through environment variables. Never commit real credentials.

The frontend can use `BASE_PATH` and `PORT` for local configuration. Production routing is defined by the Vercel configuration in `artifacts/allrated/vercel.json`.

## Production

Production is deployed through Vercel. Do not add Replit-specific setup, plugins, or deployment files.

## Safe change procedure

1. Read `AGENTS.md`.
2. Read the relevant section of `ARCHITECTURE.md`.
3. Trace the code path you will change.
4. Make the smallest coherent change.
5. Run focused validation.
6. Run broader workspace validation when appropriate.
7. Review `git diff` for accidental changes, secrets, stale files, and duplicated logic.
8. Update documentation if behavior or architecture changed.
