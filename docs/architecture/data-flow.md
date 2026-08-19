# RabbitRip Data Flow

## Authentication flow

```text
Login/Register UI
  -> `useAuth`
  -> `lib/supabase.ts`
  -> Supabase Auth
  -> session/access token
  -> protected API requests
```

The application must not maintain a competing in-memory authentication system for normal production authentication.

## Catalog flow

```text
React page/hook
  -> RabbitRip API boundary
  -> TMDB / AniList integration as appropriate
  -> normalized catalog response
  -> UI
```

TMDB is the metadata/poster/catalog source. AniList may be used by the dedicated catalog integration, with mapping/normalization where required. Neither is the playback provider.

## Watch/progress flow

```text
Watch page
  -> `/api/progress`
  -> validate Supabase access token
  -> authenticated Supabase user id
  -> Neon/PostgreSQL
  -> progress response
  -> watch UI
```

Persistent progress belongs in Neon rather than browser-only state.

## Streaming flow

```text
Watch page
  -> `/api/bingr/stream`
  -> external streaming provider
  -> normalized/proxied stream data
  -> player
```

Provider-specific credentials and upstream assumptions remain behind the server-side boundary where required. TMDB metadata is not used as the playback source.

## Deployment flow

```text
Git push
  -> Vercel project
  -> pnpm install --frozen-lockfile
  -> workspace build
  -> Vercel deployment
  -> React static assets + serverless API functions
```

The exact deployment configuration in `artifacts/allrated/vercel.json` is the source of truth for production function routing.

## Legacy migration flow

The legacy `/api/index.js` surface should be migrated incrementally:

```text
inventory route
  -> trace callers
  -> identify current owner
  -> migrate to Supabase/Neon/current provider boundary
  -> verify production route
  -> remove legacy route
  -> remove catch-all when no longer needed
```

Do not delete the monolith before this sequence is complete.
