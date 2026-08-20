const CINEMOVE_BASE = 'https://cinemove.cc';
const CINEMOVE_SOURCES = ['holly', 'vidapi', 'netmirror', 'opstream', 'pengu', 'kinoger', 'vaplayer', 'cinesu', 'meowtv', 'hexa'];

function getSetCookie(headers) {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie();
  const value = headers.get('set-cookie');
  return value ? [value] : [];
}

function cookieHeader(setCookies) {
  return setCookies.map((value) => value.split(';', 1)[0]).filter(Boolean).join('; ');
}

function normalizeUrl(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/media-proxy\?/i.test(trimmed)) return `${CINEMOVE_BASE}${trimmed}`;
  if (/^media-proxy\?/i.test(trimmed)) return `${CINEMOVE_BASE}/${trimmed}`;
  return null;
}

function isCineMoveToken(value) {
  return typeof value === 'string' && /^v1\.[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)?$/.test(value.trim());
}

function sourceFromUrl(url, fallbackName, extra = {}) {
  const normalized = normalizeUrl(url);
  if (!normalized) return null;
  const lower = normalized.toLowerCase();
  return {
    url: normalized,
    type: lower.includes('.m3u8') || lower.includes('media-proxy?t=') ? 'hls' : lower.includes('.mpd') ? 'dash' : 'mp4',
    quality: extra.quality ?? extra.resolution ?? extra.height ?? 'Auto',
    sourceId: extra.sourceId ?? extra.source_id ?? extra.id ?? fallbackName,
    sourceName: extra.sourceName ?? extra.source_name ?? extra.name ?? extra.label ?? fallbackName,
    provider: extra.provider,
    headers: extra.headers,
    audio: Array.isArray(extra.audio) ? extra.audio : undefined,
    subtitles: Array.isArray(extra.subtitles) ? extra.subtitles : undefined,
  };
}

function extractSources(data, sourceName) {
  const found = [];
  const seen = new Set();
  const add = (candidate) => {
    if (candidate && !seen.has(candidate.url)) {
      seen.add(candidate.url);
      found.push(candidate);
    }
  };
  const visit = (value) => {
    if (value == null) return;
    if (typeof value === 'string') {
      const text = value.trim();
      if (/\/media-proxy\?/i.test(text) || isCineMoveToken(text)) {
        const url = /\/media-proxy\?/i.test(text)
          ? text
          : `${CINEMOVE_BASE}/media-proxy?t=${encodeURIComponent(text)}`;
        add(sourceFromUrl(url, sourceName));
      }
      return;
    }
    if (typeof value !== 'object') return;
    const url = value.url ?? value.streamUrl ?? value.stream_url ?? value.file ?? value.src ?? value.m3u8 ?? value.hls ?? value.mp4 ?? value.playlist ?? value.manifest ?? value.proxyUrl ?? value.mediaProxy;
    add(sourceFromUrl(url, sourceName, value));
    for (const nested of Object.values(value)) visit(nested);
  };
  visit(data);
  return found;
}

function tokenSources(source, data, headers) {
  const sources = extractSources(data, source);
  const tokens = [data?.token, data?.mediaToken, data?.media_token, data?.proxyToken, data?.proxy_token, data?.t];
  for (const name of ['location', 'content-location', 'x-stream-url', 'x-media-url', 'x-stream', 'x-url']) {
    const value = headers.get(name);
    if (value) tokens.push(value);
  }
  for (const token of tokens) {
    if (typeof token !== 'string' || token.length < 20 || token.includes(' ')) continue;
    const candidateUrl = /^https?:\/\//i.test(token) || /^\/media-proxy\?/i.test(token)
      ? token
      : `${CINEMOVE_BASE}/media-proxy?t=${encodeURIComponent(token)}`;
    const candidate = sourceFromUrl(candidateUrl, source, data || {});
    if (candidate && !sources.some((item) => item.url === candidate.url)) sources.push(candidate);
  }
  return sources;
}

export default async function handler(req, res) {
  try {
    const input = req.query || {};
    for (const key of ['tmdbId', 'mediaType', 'title']) {
      if (!input[key]) return res.status(400).json({ error: `Missing ${key}` });
    }

    const mediaType = String(input.mediaType);
    const season = input.season || 1;
    const episode = input.episode || 1;
    const watchPath = mediaType === 'show'
      ? `/watch/show/${encodeURIComponent(input.tmdbId)}?s=${encodeURIComponent(season)}&e=${encodeURIComponent(episode)}`
      : `/watch/movie/${encodeURIComponent(input.tmdbId)}`;
    const referer = `${CINEMOVE_BASE}${watchPath}`;
    const ua = req.headers['user-agent'] || 'Mozilla/5.0 RabbitRip';

    const bootstrap = await fetch(referer, {
      headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': ua },
    });
    const cookie = cookieHeader(getSetCookie(bootstrap.headers));
    let pageHtml = '';
    try { pageHtml = await bootstrap.text(); } catch {}
    const discoveredImdb = pageHtml.match(/tt\d{6,10}/)?.[0];

    const base = new URLSearchParams({
      tmdbId: String(input.tmdbId),
      mediaType,
      title: String(input.title),
      year: String(input.year || ''),
    });
    const imdbId = input.imdbId || discoveredImdb;
    if (imdbId) base.set('imdbId', String(imdbId));
    if (mediaType === 'show') {
      base.set('season', String(season));
      base.set('episode', String(episode));
    }

    const requestedSources = input.source ? [String(input.source)] : CINEMOVE_SOURCES;
    const results = await Promise.all(requestedSources.map(async (source) => {
      try {
        const params = new URLSearchParams(base);
        params.set('source', source);
        const upstream = await fetch(`${CINEMOVE_BASE}/api/stream?${params.toString()}`, {
          headers: {
            Accept: '*/*',
            Referer: referer,
            Origin: CINEMOVE_BASE,
            'User-Agent': ua,
            ...(cookie ? { Cookie: cookie } : {}),
          },
        });
        const contentType = upstream.headers.get('content-type') || '';
        let data = null;
        if (contentType.includes('json')) {
          data = await upstream.json().catch(() => null);
        } else {
          const text = await upstream.text().catch(() => '');
          try { data = JSON.parse(text); } catch { data = text; }
        }
        return { source, ok: upstream.ok, status: upstream.status, sources: upstream.ok ? tokenSources(source, data, upstream.headers) : [], error: upstream.ok ? undefined : `HTTP ${upstream.status}` };
      } catch (error) {
        return { source, ok: false, status: 0, sources: [], error: error?.message || 'request failed' };
      }
    }));

    const uniqueSources = results.flatMap((result) => result.sources).filter((item, index, list) => list.findIndex((other) => other.url === item.url) === index);
    if (!uniqueSources.length) {
      return res.status(502).json({ error: 'CineMove returned no playable stream', details: results.map(({ source, status, error }) => ({ source, status, error })) });
    }

    return res.status(200).json({ sources: uniqueSources, subtitles: uniqueSources.flatMap((item) => item.subtitles || []) });
  } catch (error) {
    return res.status(502).json({ error: error?.message || 'Unable to reach CineMove' });
  }
}
