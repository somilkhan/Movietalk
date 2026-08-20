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

function normalizeUrl(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/media-proxy\?/i.test(trimmed)) return `${CINEMOVE_BASE}${trimmed}`;
  if (/^media-proxy\?/i.test(trimmed)) return `${CINEMOVE_BASE}/${trimmed}`;
  return null;
}

function sourceFromUrl(url, fallbackName, extra = {}) {
  const normalized = normalizeUrl(url);
  if (!normalized) return null;
  const lower = normalized.toLowerCase();
  return {
    url: normalized,
    type: lower.includes('.m3u8') || lower.includes('application/vnd.apple.mpegurl') || lower.includes('media-proxy?t=') ? 'hls' : lower.includes('.mpd') ? 'dash' : 'mp4',
    quality: extra.quality ?? extra.resolution ?? extra.height ?? 'Auto',
    sourceId: extra.sourceId ?? extra.source_id ?? extra.id ?? fallbackName,
    sourceName: extra.sourceName ?? extra.source_name ?? extra.name ?? extra.label ?? fallbackName,
    provider: extra.provider,
    headers: extra.headers,
    audio: Array.isArray(extra.audio) ? extra.audio : undefined,
    subtitles: Array.isArray(extra.subtitles) ? extra.subtitles : undefined,
  };
}

function asSource(value, fallbackName) {
  if (!value || typeof value !== 'object') return null;
  const url = value.url ?? value.streamUrl ?? value.stream_url ?? value.file ?? value.src ?? value.m3u8 ?? value.hls ?? value.mp4 ?? value.playlist ?? value.manifest ?? value.proxyUrl ?? value.mediaProxy;
  return sourceFromUrl(url, fallbackName, value);
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
      if (/\/media-proxy\?/i.test(value)) add(sourceFromUrl(value, sourceName));
      return;
    }

    if (typeof value !== 'object') return;

    add(asSource(value, sourceName));

    if (Array.isArray(value)) {
      value.forEach(visit);
    } else {
      Object.values(value).forEach(visit);
    }
  };

  visit(data);
  return found;
}

function sourceResponse(source, data) {
  const sources = extractSources(data, source);

  // Some CineMove responses expose the signed token separately. Only build
  // the media-proxy URL when it is explicitly labelled as a media token.
  const tokenCandidates = [
    data?.token,
    data?.mediaToken,
    data?.media_token,
    data?.proxyToken,
    data?.proxy_token,
    data?.t,
  ];

  for (const token of tokenCandidates) {
    if (typeof token === 'string' && token.length > 20 && !token.includes(' ')) {
      const candidate = sourceFromUrl(`${CINEMOVE_BASE}/media-proxy?t=${encodeURIComponent(token)}`, source, data || {});
      if (candidate && !sources.some((item) => item.url === candidate.url)) sources.push(candidate);
    }
  }

  return sources;
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

    const bootstrap = await fetch(referer, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': ua,
      },
    });
    const cookie = cookieHeader(getSetCookie(bootstrap.headers));

    const base = new URLSearchParams({
      tmdbId: String(input.tmdbId),
      mediaType,
      title: String(input.title),
      year: String(input.year),
    });
    if (input.imdbId) base.set('imdbId', String(input.imdbId));
    if (input.season !== undefined) base.set('season', String(input.season));
    if (input.episode !== undefined) base.set('episode', String(input.episode));

    const requestedSources = input.source ? [String(input.source)] : CINEMOVE_SOURCES;
    const results = await Promise.all(requestedSources.map(async (source) => {
      try {
        const params = new URLSearchParams(base);
        params.set('source', source);

        const upstream = await fetch(`${CINEMOVE_BASE}/api/stream?${params.toString()}`, {
          headers: {
            Accept: 'application/json, text/plain, */*',
            Referer: referer,
            Origin: CINEMOVE_BASE,
            'User-Agent': ua,
            ...(cookie ? { Cookie: cookie } : {}),
          },
        });

        const text = await upstream.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }

        return {
          source,
          ok: upstream.ok,
          status: upstream.status,
          data,
          sources: upstream.ok ? sourceResponse(source, data) : [],
        };
      } catch (error) {
        return { source, ok: false, status: 0, data: null, sources: [], error: error?.message || 'request failed' };
      }
    }));

    const uniqueSources = results
      .flatMap((result) => result.sources || [])
      .filter((item, index, list) => list.findIndex((other) => other.url === item.url) === index);

    if (!uniqueSources.length) {
      return res.status(502).json({
        error: 'CineMove returned no playable stream',
        details: results.map(({ source, status, error }) => ({ source, status, error })),
      });
    }

    return res.status(200).json({
      sources: uniqueSources,
      subtitles: uniqueSources.flatMap((item) => item.subtitles || []),
    });
  } catch (error) {
    return res.status(502).json({ error: error?.message || 'Unable to reach CineMove' });
  }
}
