import pg from 'pg';

const { Pool } = pg;
let pool;
let schemaReady;

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS watch_progress (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
        tmdb_id INTEGER NOT NULL,
        season INTEGER,
        episode INTEGER,
        position_seconds DOUBLE PRECISION NOT NULL DEFAULT 0,
        duration_seconds DOUBLE PRECISION NOT NULL DEFAULT 0,
        title TEXT,
        poster_path TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, media_type, tmdb_id, season, episode)
      )
    `).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

function positiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function finiteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function normalizeUserId(value) {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  return id && id.length <= 128 ? id : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    await ensureSchema();

    if (req.method === 'GET') {
      const userId = normalizeUserId(req.query?.userId);
      const mediaType = req.query?.mediaType === 'tv' ? 'tv' : 'movie';
      const tmdbId = positiveInt(req.query?.id);
      const season = req.query?.season === undefined ? null : positiveInt(req.query?.season);
      const episode = req.query?.episode === undefined ? null : positiveInt(req.query?.episode);

      if (!userId || !tmdbId) {
        res.status(400).json({ error: 'Missing userId or id' });
        return;
      }

      const result = await getPool().query(
        `SELECT user_id, media_type, tmdb_id, season, episode, position_seconds, duration_seconds, title, poster_path, updated_at
         FROM watch_progress
         WHERE user_id = $1 AND media_type = $2 AND tmdb_id = $3
           AND season IS NOT DISTINCT FROM $4 AND episode IS NOT DISTINCT FROM $5
         LIMIT 1`,
        [userId, mediaType, tmdbId, season, episode],
      );

      res.status(200).json({ progress: result.rows[0] || null });
      return;
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const userId = normalizeUserId(body.userId);
      const mediaType = body.mediaType === 'tv' ? 'tv' : body.mediaType === 'movie' ? 'movie' : null;
      const tmdbId = positiveInt(body.id);
      const season = body.season === undefined || body.season === null ? null : positiveInt(body.season);
      const episode = body.episode === undefined || body.episode === null ? null : positiveInt(body.episode);
      const position = finiteNumber(body.position);
      const duration = finiteNumber(body.duration) ?? 0;

      if (!userId || !mediaType || !tmdbId || position === null) {
        res.status(400).json({ error: 'Invalid progress payload' });
        return;
      }
      if (mediaType === 'tv' && ((season === null) !== (episode === null))) {
        res.status(400).json({ error: 'TV progress requires both season and episode' });
        return;
      }

      const title = typeof body.title === 'string' ? body.title.slice(0, 500) : null;
      const posterPath = typeof body.posterPath === 'string' ? body.posterPath.slice(0, 500) : null;

      const result = await getPool().query(
        `INSERT INTO watch_progress
          (user_id, media_type, tmdb_id, season, episode, position_seconds, duration_seconds, title, poster_path, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
         ON CONFLICT (user_id, media_type, tmdb_id, season, episode)
         DO UPDATE SET
           position_seconds = EXCLUDED.position_seconds,
           duration_seconds = EXCLUDED.duration_seconds,
           title = COALESCE(EXCLUDED.title, watch_progress.title),
           poster_path = COALESCE(EXCLUDED.poster_path, watch_progress.poster_path),
           updated_at = NOW()
         RETURNING user_id, media_type, tmdb_id, season, episode, position_seconds, duration_seconds, title, poster_path, updated_at`,
        [userId, mediaType, tmdbId, season, episode, position, duration, title, posterPath],
      );

      res.status(200).json({ ok: true, progress: result.rows[0] });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[progress] database error', error);
    res.status(500).json({ error: 'Progress storage unavailable' });
  }
}
