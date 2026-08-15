const STREAMRIP_BASE = 'https://streamrip.fun/api/download';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const mediaType = String(req.query?.mediaType || '').toLowerCase();
  const id = Number(req.query?.id);
  const season = Number(req.query?.season);
  const episode = Number(req.query?.episode);

  if (!['movie', 'tv'].includes(mediaType) || !Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Valid mediaType and id are required' });
    return;
  }
  if (mediaType === 'tv' && (!Number.isInteger(season) || season <= 0 || !Number.isInteger(episode) || episode <= 0)) {
    res.status(400).json({ error: 'TV downloads require season and episode' });
    return;
  }

  const url = new URL(`${STREAMRIP_BASE}/${mediaType}/${id}`);
  if (mediaType === 'tv') {
    url.searchParams.set('season', String(season));
    url.searchParams.set('episode', String(episode));
  }

  try {
    const upstream = await fetch(url, { headers: { Accept: 'application/json' } });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (error) {
    res.status(502).json({ error: 'Download provider unavailable', message: error instanceof Error ? error.message : String(error) });
  }
}
