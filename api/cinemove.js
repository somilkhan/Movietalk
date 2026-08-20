/**
 * CineMove Server 2 adapter.
 *
 * Talks to CineMove's own /api/stream contract and forwards freshly generated
 * signed media URLs. Signed media-proxy tokens are never stored or hardcoded.
 *
 * CINEMOVE_SOURCES may override the currently observed CineMove source IDs.
 * Keeping this in configuration means new CineMove sources can be added
 * without changing the player or adapter code.
 */

const DEFAULT_CINEMOVE_URL = 'https://cinemove.cc';
const DEFAULT_SOURCE_IDS = ['holly', 'cinesu', 'pengu', 'hexa', 'vidup'];
const REQUEST_TIMEOUT_MS = 15_000;

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}
function baseUrl() { return String(process.env.CINEMOVE_URL || DEFAULT_CINEMOVE_URL).replace(/\/+$/, ''); }
function positive(value, name) {
  if (!/^\d+$/.test(String(value || ''))) throw Object.assign(new Error(`${name} must be a positive integer`), { statusCode: 400 });
  return String(value);
}
function sourceList() {
  const configured = String(process.env.CINEMOVE_SOURCES || '').split(',').map((v) => v.trim()).filter(Boolean);
  return configured.length ? configured : DEFAULT_SOURCE_IDS;
}
function firstSetCookie(headers) {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie().join('; ');
  return headers.get('set-cookie') || '';
}
function normalizeSubtitles(items) {
  return (Array.isArray(items) ? items : []).filter((item) => item && typeof item.url === 'string').map((item) => ({
    url: item.url,
    label: item.label || item.name || item.language || 'Auto',
    language: item.language || item.label || 'unknown',
  }));
}
function normalizePayload(payload, requestedSource) {
  if (!payload || typeof payload !== 'object') return { sources: [], subtitles: [] };
  const root = payload;
  const candidates = [
    ...(Array.isArray(root.sources) ? root.sources : []),
    ...(Array.isArray(root.streams) ? root.streams : []),
    ...(Array.isArray(root.results) ? root.results : []),
  ];
  const direct = [root, root.data, root.stream, root.video, root.media].filter((v) => v && typeof v === 'object');
  for (const item of direct) if (item.url || item.src || item.streamUrl || item.playbackUrl || item.m3u8 || item.mp4) candidates.push(item);

  const normalized = candidates.map((item, index) => {
    const url = item.url || item.src || item.streamUrl || item.playbackUrl || item.m3u8 || item.mp4;
    if (!url || typeof url !== 'string') return null;
    const type = String(item.type || item.mimeType || '').toLowerCase();
    const lower = url.toLowerCase();
    const streamType = lower.includes('.m3u8') || type.includes('mpegurl') || type.includes('hls') ? 'hls' : lower.includes('.mpd') || type.includes('dash') ? 'dash' : 'mp4';
    const sourceId = String(item.sourceId || item.source || item.provider?.id || requestedSource || `cinemove-${index + 1}`);
    const sourceName = String(item.sourceName || item.name || item.label || item.provider?.name || sourceId);
    return {
      url,
      type: streamType,
      quality: item.quality ?? item.resolution ?? 'Auto',
      sourceId,
      sourceName,
      provider: { id: 'cinemove', name: 'CineMove' },
      audio: Array.isArray(item.audio) ? item.audio : undefined,
      subtitles: normalizeSubtitles(item.subtitles),
      headers: item.headers && typeof item.headers === 'object' ? item.headers : undefined,
    };
  }).filter(Boolean);

  return { sources: normalized, subtitles: normalizeSubtitles(root.subtitles || root.subtitle) };
}
async function getSession() {
  const response = await fetch(`${baseUrl()}/`, { headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': 'RabbitRip/CineMove-Adapter' } });
  return firstSetCookie(response.headers);
}
async function callStream(params, cookie, source) {
  const query = new URLSearchParams(params);
  if (source) query.set('source', source);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl()}/api/stream?${query.toString()}`, {
      headers: {
        Accept: 'application/json, text/plain, */*',
        Referer: `${baseUrl()}/watch/${params.mediaType === 'show' ? `show/${params.tmdbId}?s=${params.season}&e=${params.episode}` : `movie/${params.tmdbId}`}`,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      signal: controller.signal,
    });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch {}
    return { response, payload };
  } finally { clearTimeout(timeout); }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return json(res, 405, { error: 'Method not allowed' }); }
  try {
    const tmdbId = positive(req.query?.tmdbId, 'tmdbId');
    const mediaType = String(req.query?.mediaType || '').toLowerCase();
    const title = String(req.query?.title || '');
    const year = String(req.query?.year || '');
    if (!['movie', 'show'].includes(mediaType)) return json(res, 400, { error: 'mediaType must be movie or show' });

    const params = { tmdbId, mediaType, title, year };
    if (mediaType === 'show') {
      params.season = positive(req.query?.season, 'season');
      params.episode = positive(req.query?.episode, 'episode');
    }
    if (req.query?.imdbId) params.imdbId = String(req.query.imdbId);

    const cookie = await getSession().catch(() => '');
    const requested = req.query?.source ? String(req.query.source) : '';
    const sourcesToTry = requested ? [requested] : sourceList();
    const results = [];
    const failures = [];
    const responses = await Promise.allSettled(sourcesToTry.map((source) => callStream(params, cookie, source)));

    responses.forEach((entry, index) => {
      const source = sourcesToTry[index];
      if (entry.status === 'rejected') { failures.push({ source, error: entry.reason?.message || 'request failed' }); return; }
      if (!entry.value.response.ok) { failures.push({ source, status: entry.value.response.status }); return; }
      results.push(...normalizePayload(entry.value.payload, source).sources);
    });

    const unique = [];
    const seen = new Set();
    for (const source of results) {
      const key = `${source.sourceId}|${source.url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(source);
    }
    if (!unique.length) return json(res, 502, { error: 'CineMove returned no playable source', failures });
    return json(res, 200, { sources: unique, subtitles: [] });
  } catch (error) {
    if (error?.name === 'AbortError') return json(res, 504, { error: 'CineMove request timed out' });
    if (error?.statusCode) return json(res, error.statusCode, { error: error.message });
    console.error('[cinemove] upstream request failed', error);
    return json(res, 502, { error: 'CineMove server unavailable' });
  }
}
