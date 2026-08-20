const CINEMOVE_BASE = 'https://cinemove.cc';

export default async function handler(req, res) {
  try {
    const input = req.query || {};
    const required = ['tmdbId', 'mediaType', 'title', 'year'];
    for (const key of required) {
      if (!input[key]) return res.status(400).json({ error: `Missing ${key}` });
    }

    const params = new URLSearchParams({
      tmdbId: String(input.tmdbId),
      mediaType: String(input.mediaType),
      title: String(input.title),
      year: String(input.year),
    });

    for (const key of ['source', 'imdbId', 'season', 'episode']) {
      if (input[key] !== undefined && input[key] !== '') params.set(key, String(input[key]));
    }

    const upstream = await fetch(`${CINEMOVE_BASE}/api/stream?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': req.headers['user-agent'] || 'RabbitRip',
      },
    });

    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error || `CineMove returned HTTP ${upstream.status}`,
        details: data,
      });
    }

    // Pass through CineMove's dynamic response. Signed media-proxy URLs must
    // remain dynamic and are never stored or hardcoded by RabbitRip.
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      error: error?.message || 'Unable to reach CineMove',
    });
  }
}
