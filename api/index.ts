const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";
const ANIMATION_GENRE_ID = 16;

function mapTitle(raw: any, fallbackMediaType?: string) {
  const mediaType = raw.media_type || fallbackMediaType || "movie";
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

async function tmdbFetch(path: string, params: Record<string, string | number | undefined> = {}) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", key);
  for (const [k, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(k, String(value));
  }
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  return res.json();
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace("/api", "");
  const region = url.searchParams.get("region") || "IN";

  // --- /catalog/trending ---
  if (path === "/catalog/trending") {
    const mediaType = url.searchParams.get("mediaType") || "all";
    const window = url.searchParams.get("window") || "week";
    const page = url.searchParams.get("page") || "1";
    const data = await tmdbFetch(`/trending/${mediaType}/${window}`, { page, region });
    if (!data) { res.status(500).json({ error: "TMDB error" }); return; }
    res.status(200).json(data.results.filter((r: any) => r.media_type !== "person").map((r: any) => mapTitle(r, mediaType === "all" ? undefined : mediaType)));
    return;
  }

  // --- /catalog/list ---
  if (path === "/catalog/list") {
    const mediaType = url.searchParams.get("mediaType") || "movie";
    const category = url.searchParams.get("category") || "popular";
    const page = url.searchParams.get("page") || "1";

    const endpoints: any = {
      movie: { popular: "/movie/popular", top_rated: "/movie/top_rated", now_playing: "/movie/now_playing" },
      tv: { popular: "/tv/popular", top_rated: "/tv/top_rated", on_the_air: "/tv/on_the_air" },
    };

    if (category === "animation") {
      const data = await tmdbFetch(`/discover/${mediaType}`, {
        with_genres: ANIMATION_GENRE_ID,
        sort_by: "popularity.desc",
        page,
        region,
      });
      res.status(200).json(data?.results.map((r: any) => mapTitle(r, mediaType)) || []);
      return;
    }

    // For non-US regions, use /discover with origin country for REAL regional filtering
    if (region && region !== "US") {
      const sortBy = category === "top_rated" ? "vote_average.desc" : "popularity.desc";
      const voteCountGte = category === "top_rated" ? 100 : undefined;
      const data = await tmdbFetch(`/discover/${mediaType}`, {
        sort_by: sortBy,
        with_origin_country: region,
        ...(voteCountGte ? { "vote_count.gte": voteCountGte } : {}),
        page,
      });
      res.status(200).json(data?.results.map((r: any) => mapTitle(r, mediaType)) || []);
      return;
    }

    const endpoint = endpoints[mediaType]?.[category];
    if (!endpoint) { res.status(400).json({ error: "Invalid category" }); return; }
    const data = await tmdbFetch(endpoint, { page, region });
    res.status(200).json(data?.results.map((r: any) => mapTitle(r, mediaType)) || []);
    return;
  }

  // --- /catalog/regional ---
  if (path === "/catalog/regional") {
    const mediaType = url.searchParams.get("mediaType") || "movie";
    const country = url.searchParams.get("country") || "IN";
    const page = url.searchParams.get("page") || "1";
    const data = await tmdbFetch(`/discover/${mediaType}`, {
      with_origin_country: country,
      sort_by: "popularity.desc",
      page,
    });
    res.status(200).json(data?.results.map((r: any) => mapTitle(r, mediaType)) || []);
    return;
  }

  // --- /catalog/language ---
  if (path === "/catalog/language") {
    const mediaType = url.searchParams.get("mediaType") || "movie";
    const language = url.searchParams.get("language") || "hi";
    const page = url.searchParams.get("page") || "1";
    const data = await tmdbFetch(`/discover/${mediaType}`, {
      with_original_language: language,
      sort_by: "popularity.desc",
      page,
    });
    res.status(200).json(data?.results.map((r: any) => mapTitle(r, mediaType)) || []);
    return;
  }

  // --- /catalog/anime ---
  if (path === "/catalog/anime") {
    const [movies, shows] = await Promise.all([
      tmdbFetch("/discover/movie", { with_genres: ANIMATION_GENRE_ID, with_origin_country: "JP", sort_by: "popularity.desc" }),
      tmdbFetch("/discover/tv", { with_genres: ANIMATION_GENRE_ID, with_origin_country: "JP", sort_by: "popularity.desc" }),
    ]);
    const combined = [
      ...(movies?.results || []).map((r: any) => mapTitle(r, "movie")),
      ...(shows?.results || []).map((r: any) => mapTitle(r, "tv")),
    ];
    combined.sort((a, b) => b.voteAverage - a.voteAverage);
    res.status(200).json(combined);
    return;
  }

  // --- /catalog/search ---
  if (path === "/catalog/search") {
    const query = url.searchParams.get("query") || "";
    const data = await tmdbFetch("/search/multi", { query, region });
    res.status(200).json(data?.results.filter((r: any) => r.media_type === "movie" || r.media_type === "tv").map((r: any) => mapTitle(r)) || []);
    return;
  }

  // --- /catalog/genres ---
  if (path === "/catalog/genres") {
    const mediaType = url.searchParams.get("mediaType") || "movie";
    const data = await tmdbFetch(`/genre/${mediaType}/list`);
    res.status(200).json(data?.genres || []);
    return;
  }

  // --- /catalog/title/:mediaType/:id ---
  const titleMatch = path.match(/^\/catalog\/title\/(movie|tv)\/(\d+)$/);
  if (titleMatch) {
    const [, mediaType, id] = titleMatch;
    const append = mediaType === "movie" ? "credits,videos,similar,release_dates" : "credits,videos,similar,content_ratings";
    const raw = await tmdbFetch(`/${mediaType}/${id}?append_to_response=${append}`);
    if (!raw) { res.status(404).json({ error: "Not found" }); return; }
    const base = mapTitle(raw, mediaType);
    let certification = null;
    if (mediaType === "movie" && raw.release_dates?.results) {
      const us = raw.release_dates.results.find((r: any) => r.iso_3166_1 === "US");
      certification = us?.release_dates?.[0]?.certification || null;
    } else if (mediaType === "tv" && raw.content_ratings?.results) {
      const us = raw.content_ratings.results.find((r: any) => r.iso_3166_1 === "US");
      certification = us?.rating || null;
    }
    res.status(200).json({
      ...base,
      genres: raw.genres || [],
      runtimeMinutes: raw.runtime || (raw.episode_run_time?.[0]) || null,
      numberOfSeasons: raw.number_of_seasons || null,
      certification,
      similar: raw.similar?.results.map((r: any) => mapTitle(r, mediaType)) || [],
      cast: raw.credits?.cast?.map((c: any) => ({ id: c.id, name: c.name, character: c.character, profilePath: c.profile_path ? `${IMAGE_BASE}/w200${c.profile_path}` : null })) || [],
    });
    return;
  }

  // --- /catalog/title/:mediaType/:id/videos ---
  const videosMatch = path.match(/^\/catalog\/title\/(movie|tv)\/(\d+)\/videos$/);
  if (videosMatch) {
    const [, mediaType, id] = videosMatch;
    const data = await tmdbFetch(`/${mediaType}/${id}/videos`);
    const yt = data?.results?.filter((v: any) => v.site === "YouTube") || [];
    const trailer = yt.find((v: any) => v.type === "Trailer" && v.official) || yt.find((v: any) => v.type === "Trailer") || yt.find((v: any) => v.type === "Teaser") || yt[0] || null;
    res.status(200).json({ key: trailer?.key || null });
    return;
  }

  // --- /catalog/title/:mediaType/:id/logo ---
  const logoMatch = path.match(/^\/catalog\/title\/(movie|tv)\/(\d+)\/logo$/);
  if (logoMatch) {
    const [, mediaType, id] = logoMatch;
    const data = await tmdbFetch(`/${mediaType}/${id}/images`);
    const logos = data?.logos || [];
    const logo = logos.find((l: any) => l.iso_639_1 === "en") || logos[0] || null;
    res.status(200).json({ logoPath: logo ? `${IMAGE_BASE}/w500${logo.file_path}` : null });
    return;
  }

  // --- /catalog/tv/:id/season/:season ---
  const seasonMatch = path.match(/^\/catalog\/tv\/(\d+)\/season\/(\d+)$/);
  if (seasonMatch) {
    const [, showId, seasonNumber] = seasonMatch;
    const data = await tmdbFetch(`/tv/${showId}/season/${seasonNumber}`);
    res.status(200).json(data?.episodes?.map((ep: any) => ({
      id: ep.id,
      episodeNumber: ep.episode_number,
      name: ep.name,
      overview: ep.overview,
      stillPath: ep.still_path ? `${IMAGE_BASE}/w300${ep.still_path}` : null,
      airDate: ep.air_date,
      runtime: ep.runtime,
    })) || []);
    return;
  }

  // --- /health ---
  if (path === "/health") {
    res.status(200).json({ status: "ok" });
    return;
  }

  res.status(404).json({ error: "Not found" });
}
