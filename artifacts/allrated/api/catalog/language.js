const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function mapTitle(raw, mediaType) {
  const date = raw.release_date || raw.first_air_date || null;
  return {
    id: raw.id,
    mediaType,
    title: raw.title || raw.name || "Untitled",
    posterPath: raw.poster_path ? `${IMAGE_BASE}/w500${raw.poster_path}` : null,
    backdropPath: raw.backdrop_path ? `${IMAGE_BASE}/original${raw.backdrop_path}` : null,
    overview: raw.overview || "",
    voteAverage: raw.vote_average || 0,
    year: date ? date.slice(0, 4) : null,
    genreIds: raw.genre_ids || [],
    originalLanguage: raw.original_language || null,
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const mediaType = String(req.query?.mediaType || "movie");
  const language = String(req.query?.language || "").trim().toLowerCase();
  const page = Math.max(1, Number(req.query?.page || 1));
  const region = String(req.query?.region || "IN");
  const key = process.env.TMDB_API_KEY;

  if (mediaType !== "movie" && mediaType !== "tv") { res.status(400).json({ error: "Invalid mediaType" }); return; }
  if (!/^[a-z]{2}$/.test(language)) { res.status(400).json({ error: "Invalid language" }); return; }
  if (!key) { res.status(503).json({ error: "TMDB API key is not configured", results: [] }); return; }

  try {
    const params = new URLSearchParams({ api_key: key, with_original_language: language, sort_by: "popularity.desc", page: String(page), region });
    const upstream = await fetch(`${TMDB_BASE}/discover/${mediaType}?${params}`, { headers: { Accept: "application/json" } });
    if (!upstream.ok) { res.status(502).json({ error: "TMDB request failed", results: [] }); return; }
    const data = await upstream.json();
    res.status(200).json((data?.results || []).map((item) => mapTitle(item, mediaType)));
  } catch {
    res.status(502).json({ error: "Language catalog unavailable", results: [] });
  }
}
