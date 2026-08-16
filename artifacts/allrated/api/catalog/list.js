const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";
const ANIMATION_GENRE_ID = 16;

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

async function tmdb(path, params) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", key);
  for (const [key, value] of Object.entries(params || {})) url.searchParams.set(key, String(value));
  try {
    const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const mediaType = String(req.query?.mediaType || "movie");
  const category = String(req.query?.category || "popular");
  const page = Math.max(1, Number(req.query?.page || 1));
  const region = String(req.query?.region || "IN");
  if (mediaType !== "movie" && mediaType !== "tv") { res.status(400).json({ error: "Invalid mediaType" }); return; }

  let data = null;
  if (category === "animation") {
    data = await tmdb(`/discover/${mediaType}`, { with_genres: ANIMATION_GENRE_ID, sort_by: "popularity.desc", page, region });
  } else if (mediaType === "movie" && category === "now_playing") {
    // This must remain TMDB's actual current theatrical list. Do not replace it with region-origin discovery.
    data = await tmdb("/movie/now_playing", { page, region });
  } else if (mediaType === "tv" && category === "on_the_air") {
    data = await tmdb("/tv/on_the_air", { page, region });
  } else if (region && region !== "US" && (category === "popular" || category === "top_rated")) {
    const sortBy = category === "top_rated" ? "vote_average.desc" : "popularity.desc";
    const params = { sort_by: sortBy, with_origin_country: region, page, region };
    if (category === "top_rated") params["vote_count.gte"] = 100;
    data = await tmdb(`/discover/${mediaType}`, params);
  } else {
    const endpoints = {
      movie: { popular: "/movie/popular", top_rated: "/movie/top_rated" },
      tv: { popular: "/tv/popular", top_rated: "/tv/top_rated" },
    };
    const endpoint = endpoints[mediaType]?.[category];
    if (!endpoint) { res.status(400).json({ error: "Invalid category" }); return; }
    data = await tmdb(endpoint, { page, region });
  }

  if (!data) { res.status(502).json({ error: "TMDB catalog unavailable", results: [] }); return; }
  res.status(200).json((data.results || []).map((item) => mapTitle(item, mediaType)));
}
