# API Surface

RabbitRip currently exposes API functionality from multiple locations. Treat the deployment configuration as the source of truth for production routing, and verify ownership before adding or removing a route.

## Production Vercel functions

The primary production deployment is configured by `artifacts/allrated/vercel.json`.

Current explicitly configured functions include:

| Route | Purpose | Owner |
|---|---|---|
| `/api/bingr/stream` | Bingr stream/source resolution | `artifacts/allrated/api/bingr/stream.js` |
| `/api/bingr/download` | Bingr download handling | `artifacts/allrated/api/bingr/download.js` |
| `/api/catalog/title/:mediaType/:id/similar` | Similar-title catalog data | `artifacts/allrated/api/catalog/title/similar.js` |
| `/api/catalog/genre` | Genre catalog data | `artifacts/allrated/api/catalog/genre.js` |
| `/api/catalog/anilist` | AniList-backed catalog data | `artifacts/allrated/api/catalog/anilist.js` |
| `/api/progress` | Watch progress | `artifacts/allrated/api/progress.js` |

The Vercel configuration also contains a general `/api/*` fallback to the application's API index.

## Other API surfaces

- `artifacts/api-server/` — Express server package.
- `api/` — root-level serverless code. Its production ownership must be confirmed before treating it as the canonical implementation of a route.

The repository contains duplicate-looking catalog implementations in more than one location. Do not merge, delete, or extend them based on filenames alone; trace their callers and deployment configuration first.

## API rules

- Preserve response shapes unless a deliberate API change is being made.
- Validate external input at the boundary.
- Keep provider credentials server-side.
- Return explicit error status codes rather than silently falling back to unrelated behavior.
- Document new production endpoints here.
