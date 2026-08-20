/**
 * CinePro Server 2 adapter.
 *
 * RabbitRip keeps CinePro isolated from the primary API. This endpoint only
 * forwards OMSS source requests to a configured CinePro instance and returns
 * the upstream response unchanged.
 *
 * Configure CINEPRO_URL in the Vercel/server environment, e.g.:
 *   CINEPRO_URL=https://your-cinepro-server.example
 *
 * Supported requests:
 *   GET /api/cinepro?type=movie&tmdbId=155
 *   GET /api/cinepro?type=tv&tmdbId=1399&season=1&episode=1
 */

const DEFAULT_CINEPRO_URL = 'https://cinepro.cc';
const REQUEST_TIMEOUT_MS = 12_000;

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(body));
}

function cleanBaseUrl(value) {
  return String(value || DEFAULT_CINEPRO_URL).replace(/\/+$/, '');
}

function requiredPositiveInteger(value, name) {
  if (!/^\d+$/.test(String(value || ''))) {
    const error = new Error(`${name} must be a positive integer`);
    error.statusCode = 400;
    throw error;
  }
  return String(value);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const type = String(req.query?.type || '').toLowerCase();
    const tmdbId = requiredPositiveInteger(req.query?.tmdbId, 'tmdbId');

    let path;
    if (type === 'movie') {
      path = `/v1/movies/${encodeURIComponent(tmdbId)}?platform=web`;
    } else if (type === 'tv') {
      const season = requiredPositiveInteger(req.query?.season, 'season');
      const episode = requiredPositiveInteger(req.query?.episode, 'episode');
      path = `/v1/tv/${encodeURIComponent(tmdbId)}/seasons/${encodeURIComponent(season)}/episodes/${encodeURIComponent(episode)}?platform=web`;
    } else {
      return json(res, 400, { error: 'type must be movie or tv' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let upstream;
    try {
      upstream = await fetch(`${cleanBaseUrl(process.env.CINEPRO_URL)}${path}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const contentType = upstream.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await upstream.json()
      : { error: 'CinePro returned a non-JSON response' };

    return json(res, upstream.status, payload);
  } catch (error) {
    if (error?.statusCode) {
      return json(res, error.statusCode, { error: error.message });
    }

    if (error?.name === 'AbortError') {
      return json(res, 504, { error: 'CinePro request timed out' });
    }

    console.error('[cinepro] upstream request failed', error);
    return json(res, 502, { error: 'CinePro server unavailable' });
  }
}
