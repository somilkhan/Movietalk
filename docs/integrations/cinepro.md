# CinePro — Server 2 integration

RabbitRip treats CinePro as a separate streaming backend. The primary RabbitRip/Bingr server remains unchanged; CinePro is an optional second source server.

## Architecture

```text
RabbitRip player
   ├── Server 1: RabbitRip/Bingr
   └── Server 2: CinePro (OMSS)
```

The adapter is `api/cinepro.js` and exposes one stable RabbitRip endpoint:

```text
GET /api/cinepro?type=movie&tmdbId=155
GET /api/cinepro?type=tv&tmdbId=1399&season=1&episode=1
```

The adapter forwards requests to CinePro's OMSS API and returns the upstream JSON response. This keeps CinePro-specific API details out of the player.

## Configuration

Set this server-side environment variable in Vercel:

```text
CINEPRO_URL=https://your-cinepro-server.example
```

If it is omitted, the adapter currently falls back to `https://cinepro.cc`. Prefer an explicitly controlled CinePro instance for production.

Do **not** put CinePro credentials or server secrets in `VITE_*` client variables.

## OMSS contract

CinePro Core implements OMSS and exposes movie sources at `/v1/movies/{tmdbId}` and TV episode sources at `/v1/tv/{tmdbId}/seasons/{season}/episodes/{episode}`. RabbitRip's adapter uses those endpoints with `platform=web`.

The player should consume the returned `sources` array and select a playable source according to the existing player logic. The adapter does not rewrite, scrape, or transform stream URLs.

## Failure behavior

- Invalid parameters → `400`
- Unsupported HTTP method → `405`
- CinePro timeout → `504`
- CinePro/network failure → `502`
- Upstream CinePro HTTP status → passed through

This means Server 1 remains independent: a CinePro outage cannot replace or break the existing Bingr path.

## Important deployment note

CinePro Core's upstream documentation recommends private/personal deployment and warns against exposing an instance publicly by default. If RabbitRip uses a public CinePro instance, secure it independently and configure `CINEPRO_URL` to that controlled endpoint.

Reference:
- CinePro Core: https://github.com/cinepro-org/core
- OMSS specification: https://github.com/omss-spec/omss-spec
