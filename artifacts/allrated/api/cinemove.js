const CINEMOVE_BASE = 'https://cinemove.cc';
const CINEMOVE_SOURCES = ['holly', 'cinesu', 'pengu', 'hexa'];

function getSetCookie(headers) {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie();
  const value = headers.get('set-cookie');
  return value ? [value] : [];
}
function cookieHeader(setCookies) {
  return setCookies.map((value) => value.split(';', 1)[0]).filter(Boolean).join('; ');
}
function asSource(value, fallbackName) {
  if (!value || typeof value !== 'object') return null;
  const url = value.url ?? value.streamUrl ?? value.stream_url ?? value.file ?? value.src ?? value.m3u8 ?? value.hls ?? value.mp4;
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return null;
  const type = String(value.type ?? value.mimeType ?? value.mime_type ?? '').toLowerCase();
  const lower = url.toLowerCase();
  return {
    url,
    type: type.includes('mpegurl') || type.includes('hls') || lower.includes('.m3u8') ? 'hls' : type.includes('dash') || lower.includes('.mpd') ? 'dash' : 'mp4',
    quality: value.quality ?? value.resolution ?? value.height ?? 'Auto',
    sourceId: value.sourceId ?? value.source_id ?? value.id ?? fallbackName,
    sourceName: value.sourceName ?? value.source_name ?? value.name ?? value.label ?? fallbackName,
    provider: value.provider,
    headers: value.headers,
    audio: Array.isArray(value.audio) ? value.audio : undefined,
    subtitles: Array.isArray(value.subtitles) ? value.subtitles : undefined,
  };
}
function extractSources(data, sourceName) {
  const found = [], seen = new Set();
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    const candidate = asSource(value, sourceName);
    if (candidate && !seen.has(candidate.url)) { seen.add(candidate.url); found.push(candidate); }
    if (Array.isArray(value)) value.forEach(visit); else Object.values(value).forEach(visit);
  };
  visit(data);
  return found;
}

export default async function handler(req, res) {
  try {
    const input = req.query || {};
    for (const key of ['tmdbId', 'mediaType', 'title', 'year']) {
      if (!input[key]) return res.status(400).json({ error: `Missing ${key}` });
    }

    const mediaType = String(input.mediaType);
    const watchPath = mediaType === 'show'
      ? `/watch/show/${encodeURIComponent(input.tmdbId)}?s=${encodeURIComponent(input.season || 1)}&e=${encodeURIComponent(input.episode || 1)}`
      : `/watch/movie/${encodeURIComponent(input.tmdbId)}`;
    const referer = `${CINEMOVE_BASE}${watchPath}`;
    const ua = req.headers['user-agent'] || 'Mozilla/5.0 RabbitRip';

    // CineMove establishes a visitor session before its stream endpoint is called.
    const bootstrap = await fetch(referer, { headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': ua } });
    const cookie = cookieHeader(getSetCookie(bootstrap.headers));

    const base = new URLSearchParams({
      tmdbId: String(input.tmdbId), mediaType, title: String(input.title), year: String(input.year),
    });
    if (input.imdbId) base.set('imdbId', String(input.imdbId));
    if (input.season !== undefined) base.set('season', String(input.season));
    if (input.episode !== undefined) base.set('episode', String(input.episode));

    const requestedSources = input.source ? [String(input.source)] : CINEMOVE_SOURCES;
    const results = await Promise.all(requestedSources.map(async (source) => {
      const params = new URLSearchParams(base);
      params.set('source', source);
      const upstream = await fetch(`${CINEMOVE_BASE}/api/stream?${params.toString()}`, {
        headers: {
          Accept: 'application/json, text/plain, */*', Referer: referer, Origin: CINEMOVE_BASE,
          'User-Agent': ua, ...(cookie ? { Cookie: cookie } : {}),
        },
      });
      const text = await upstream.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }
      return { source, ok: upstream.ok, status: upstream.status, data };
    }));

    const sources = results.flatMap((result) => result.ok ? extractSources(result.data, result.source) : []);
    const uniqueSources = sources.filter((item, index, list) => list.findIndex((other) => other.url === item.url) === index);
    if (!uniqueSources.length) {
      return res.status(502).json({ error: 'CineMove returned no playable stream', details: results.map(({ source, status, data }) => ({ source, status, data })) });
    }
    return res.status(200).json({ sources: uniqueSources });
  } catch (error) {
    return res.status(502).json({ error: error?.message || 'Unable to reach CineMove' });
  }
}
