import pg from 'pg';

const { Pool } = pg;
let pool;
let schemaReady;

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 10000, connectionTimeoutMillis: 5000 });
  return pool;
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const database = getPool();
      await database.query(`CREATE TABLE IF NOT EXISTS watch_progress (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        profile_id TEXT NOT NULL DEFAULT 'default',
        media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
        tmdb_id INTEGER NOT NULL,
        season INTEGER,
        episode INTEGER,
        position_seconds DOUBLE PRECISION NOT NULL DEFAULT 0,
        duration_seconds DOUBLE PRECISION NOT NULL DEFAULT 0,
        title TEXT,
        poster_path TEXT,
        backdrop_path TEXT,
        completed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
      await database.query(`ALTER TABLE watch_progress ADD COLUMN IF NOT EXISTS profile_id TEXT NOT NULL DEFAULT 'default'`);
      await database.query(`ALTER TABLE watch_progress ADD COLUMN IF NOT EXISTS backdrop_path TEXT`);
      await database.query(`ALTER TABLE watch_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`);
      await database.query(`DROP INDEX IF EXISTS watch_progress_content_key`);
      await database.query(`CREATE UNIQUE INDEX IF NOT EXISTS watch_progress_content_key ON watch_progress (user_id, profile_id, media_type, tmdb_id, COALESCE(season, 0), COALESCE(episode, 0))`);
    })().catch((error) => { schemaReady = null; throw error; });
  }
  await schemaReady;
}

function positiveInt(value) { const n = Number(value); return Number.isInteger(n) && n > 0 ? n : null; }
function finiteNumber(value) { const n = Number(value); return Number.isFinite(n) && n >= 0 ? n : null; }

async function getSupabaseUser(req) {
  const authorization = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) return null;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase Auth is not configured');
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: supabaseKey, Authorization: authorization } });
  if (!response.ok) return null;
  const user = await response.json();
  return typeof user?.id === 'string' && user.id ? user : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  try {
    const user = await getSupabaseUser(req);
    if (!user) { res.status(401).json({ error: 'Authentication required' }); return; }
    await ensureSchema();
    const userId = user.id;

    if (req.method === 'GET') {
      const profileId = String(req.query?.profileId || 'default').slice(0, 200);
      if (req.query?.list === '1' || req.query?.list === 'true') {
        const result = await getPool().query(
          `SELECT tmdb_id AS id, media_type AS "mediaType", season, episode, position_seconds,
                  duration_seconds, title, poster_path, backdrop_path, updated_at
           FROM watch_progress
           WHERE user_id = $1 AND profile_id = $2 AND completed_at IS NULL
           ORDER BY updated_at DESC LIMIT 50`,
          [userId, profileId],
        );
        res.status(200).json({ items: result.rows });
        return;
      }
      const mediaType = req.query?.mediaType === 'tv' ? 'tv' : 'movie';
      const tmdbId = positiveInt(req.query?.id);
      const season = req.query?.season === undefined ? null : positiveInt(req.query?.season);
      const episode = req.query?.episode === undefined ? null : positiveInt(req.query?.episode);
      if (!tmdbId) { res.status(400).json({ error: 'Missing id' }); return; }
      const result = await getPool().query(
        `SELECT user_id, profile_id, media_type, tmdb_id, season, episode, position_seconds,
                duration_seconds, title, poster_path, backdrop_path, completed_at, updated_at
         FROM watch_progress
         WHERE user_id = $1 AND profile_id = $2 AND media_type = $3 AND tmdb_id = $4
           AND season IS NOT DISTINCT FROM $5 AND episode IS NOT DISTINCT FROM $6 LIMIT 1`,
        [userId, profileId, mediaType, tmdbId, season, episode],
      );
      res.status(200).json({ progress: result.rows[0] || null });
      return;
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const profileId = String(body.profileId || 'default').slice(0, 200);
      const mediaType = body.mediaType === 'tv' ? 'tv' : body.mediaType === 'movie' ? 'movie' : null;
      const tmdbId = positiveInt(body.id);
      const season = body.season === undefined || body.season === null ? null : positiveInt(body.season);
      const episode = body.episode === undefined || body.episode === null ? null : positiveInt(body.episode);
      const position = finiteNumber(body.position);
      const duration = finiteNumber(body.duration) ?? 0;
      if (!mediaType || !tmdbId || position === null) { res.status(400).json({ error: 'Invalid progress payload' }); return; }
      if (mediaType === 'tv' && ((season === null) !== (episode === null))) { res.status(400).json({ error: 'TV progress requires both season and episode' }); return; }
      const title = typeof body.title === 'string' ? body.title.slice(0, 500) : null;
      const posterPath = typeof body.posterPath === 'string' ? body.posterPath.slice(0, 500) : null;
      const backdropPath = typeof body.backdropPath === 'string' ? body.backdropPath.slice(0, 500) : null;
      const completed = body.completed === true;
      const result = await getPool().query(
        `INSERT INTO watch_progress
          (user_id, profile_id, media_type, tmdb_id, season, episode, position_seconds, duration_seconds, title, poster_path, backdrop_path, completed_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,${completed ? 'NOW()' : 'NULL'},NOW())
         ON CONFLICT (user_id, profile_id, media_type, (COALESCE(season, 0)), (COALESCE(episode, 0)))
         DO UPDATE SET position_seconds = EXCLUDED.position_seconds,
                       duration_seconds = EXCLUDED.duration_seconds,
                       title = COALESCE(EXCLUDED.title, watch_progress.title),
                       poster_path = COALESCE(EXCLUDED.poster_path, watch_progress.poster_path),
                       backdrop_path = COALESCE(EXCLUDED.backdrop_path, watch_progress.backdrop_path),
                       completed_at = EXCLUDED.completed_at,
                       updated_at = NOW()
         RETURNING tmdb_id AS id, media_type AS "mediaType", profile_id, season, episode,
                   position_seconds, duration_seconds, title, poster_path, backdrop_path, completed_at, updated_at`,
        [userId, profileId, mediaType, tmdbId, season, episode, position, duration, title, posterPath, backdropPath],
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
