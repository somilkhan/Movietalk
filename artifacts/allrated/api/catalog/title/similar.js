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

async function tmdbList(mediaType, id, endpoint, key) {
  const url = `${TMDB_BASE}/${mediaType}/${id}/${endpoint}?api_key=${encodeURIComponent(key)}&language=en-US&page=1`;
  const upstream = await fetch(url, { headers: { Accept: "application/json" } });
  if (!upstream.ok) return [];
  const data = await upstream.json();
  return Array.isArray(data?.results) ? data.results : [];
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
    // Recommendations are the primary source for a player-facing "More Like This" row.
    // TMDB's similar endpoint is only a fallback when recommendations are unavailable.
    const recommended = await tmdbList(mediaType, id, "recommendations", key);
    const fallback = recommended.length ? [] : await tmdbList(mediaType, id, "similar", key);
    const seen = new Set([id]);
    const results = [...recommended, ...fallback]
      .filter((item) => item && Number.isFinite(Number(item.id)) && !seen.has(Number(item.id)))
      .filter((item) => {
        const itemId = Number(item.id);
        if (seen.has(itemId)) return false;
        seen.add(itemId);
        return true;
      })
      .slice(0, 20)
      .map((item) => mapTitle(item, mediaType));

    res.status(200).json({ results });
  } catch {
    res.status(502).json({ error: "Recommendations service unavailable", results: [] });
  }
}
