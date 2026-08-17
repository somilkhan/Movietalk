# RabbitRip

RabbitRip is a web application for browsing and watching movies and TV content, with catalog, watch-history, recommendation, and streaming functionality.

## Production

RabbitRip is deployed on Vercel.

- Production: https://rabbitrip.vercel.app
- Repository: https://github.com/somilkhan/RabbitRip

Replit is not part of the supported project workflow.

## Repository map

```text
artifacts/allrated/     Primary web application + Vercel API functions
artifacts/api-server/   Express server package
artifacts/cinepro-core/ Separate CinePro service/core
lib/                    Shared workspace packages
api/                    Root-level serverless code; verify ownership before extending
clone-data/             Reference/research material
scripts/                Repository tooling
```

## Architecture

The primary production application lives in `artifacts/allrated/`. Its Vite build produces the web client, while its `api/` directory contains Vercel function entry points used by the deployed application.

The repository also contains separate workspace services and shared packages. These boundaries are intentional and should not be collapsed without tracing their callers and deployment ownership first.

Read [`ARCHITECTURE.md`](ARCHITECTURE.md) before making cross-package changes.

## Working with coding agents

Start with [`AGENTS.md`](AGENTS.md). It defines the repository rules, ownership model, validation workflow, and safety constraints for ChatGPT, Kimi, and other coding agents.

## Development

See [`DEVELOPMENT.md`](DEVELOPMENT.md) for setup and validation commands.

## API

See [`docs/API.md`](docs/API.md) for the current API surface and ownership model.
