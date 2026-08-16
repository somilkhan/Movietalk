const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

const GENRES = new Set([
  28, 35, 27, 10749, 878, 80, 18, 10751, 10764, 53, 9648, 14, 12, 16, 36, 99, 10402, 10770, 37, 10752, 10759, 10762, 10763, 10765, 10766, 10767, 10768,
]);

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
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }
  const mediaType = String(req.query?.mediaType || "movie");
  const genreId = Number(req.query?.genreId);
  const page = Math.max(1, Number(req.query?.page || 1));
  const region = String(req.query?.region || "IN");
  const key = process.env.TMDB_API_KEY;
  if (mediaType !== "movie" && mediaType !== "tv") { res.status(400).json({ error: "Invalid mediaType" }); return; }
  if (!GENRES.has(genreId)) { res.status(400).json({ error: "Unsupported genre" }); return; }
  if (!key) { res.status(503).json({ error: "TMDB API key is not configured", results: [] }); return; }
  try {
    const params = new URLSearchParams({ api_key: key, with_genres: String(genreId), sort_by: "popularity.desc", page: String(page), region });
    const upstream = await fetch(`${TMDB_BASE}/discover/${mediaType}?${params}`, { headers: { Accept: "application/json" } });
    if (!upstream.ok) { res.status(502).json({ error: "TMDB request failed", results: [] }); return; }
    const data = await upstream.json();
    res.status(200).json((data?.results || []).map((item) => mapTitle(item, mediaType)));
  } catch { res.status(502).json({ error: "Genre catalog unavailable", results: [] }); }
}
