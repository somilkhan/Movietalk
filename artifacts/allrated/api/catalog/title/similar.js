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
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const mediaType = String(req.query?.mediaType || "");
  const id = Number(req.query?.id);
  const key = process.env.TMDB_API_KEY;

  if (!["movie", "tv"].includes(mediaType) || !Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid mediaType or id" });
    return;
  }

  if (!key) {
    res.status(503).json({ error: "TMDB API key is not configured", results: [] });
    return;
  }

  try {
    const url = `${TMDB_BASE}/${mediaType}/${id}/similar?api_key=${encodeURIComponent(key)}&page=1`;
    const upstream = await fetch(url, { headers: { Accept: "application/json" } });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "TMDB similar titles request failed", results: [] });
      return;
    }
    const data = await upstream.json();
    res.status(200).json({
      results: (Array.isArray(data?.results) ? data.results : [])
        .slice(0, 20)
        .map((item) => mapTitle(item, mediaType)),
    });
  } catch {
    res.status(502).json({ error: "Similar titles service unavailable", results: [] });
  }
}
