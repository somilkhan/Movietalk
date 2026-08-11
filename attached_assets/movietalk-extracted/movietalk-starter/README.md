# movietalk

A pixel-perfect clone of [bingr.one](https://bingr.one) built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
```

Get your API key at [TMDB](https://www.themoviedb.org/settings/api).

## Project Structure

- `app/` — Next.js App Router pages and components
- `lib/` — API clients, hooks, utilities
- `types/` — TypeScript type definitions
- `public/` — Static assets

## Agent Workflow

1. Read `.github/AGENT_INSTRUCTIONS.md` for project rules
2. Read `HANDOFF.md` for current status
3. Read `bingr-one-observations.md` for target site data
4. Make changes → build → commit → push
5. Update `HANDOFF.md` before session ends

## Deployment

Auto-deploys to Vercel on every push to `main`.

## Target Site

https://bingr.one
