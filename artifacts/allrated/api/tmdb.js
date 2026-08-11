const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function apiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    console.warn("[TMDB] TMDB_API_KEY not set — returning empty data");
    return null;
  }
  return key;
}

async function tmdbFetch(path, params = {}) {
  const key = apiKey();
  if (!key) return null;

  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", key);
  for (const [k, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(k, String(value));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    console.error(`[TMDB] Request failed: ${res.status} ${path} — ${body.slice(0, 200)}`);
    return null;
  }
  return await res.json();
}

function mapTitle(raw, fallbackMediaType) {
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

export async function getTrending(mediaType, window, page = 1) {
  const data = await tmdbFetch(`/trending/${mediaType}/${window}`, { page });
  if (!data) return [];
  return data.results
    .filter((r) => r.media_type !== "person")
    .map((r) => mapTitle(r, mediaType === "all" ? undefined : mediaType));
}

const LIST_ENDPOINTS = {
  movie: {
    popular: "/movie/popular",
    top_rated: "/movie/top_rated",
    now_playing: "/movie/now_playing",
  },
  tv: {
    popular: "/tv/popular",
    top_rated: "/tv/top_rated",
    on_the_air: "/tv/on_the_air",
  },
};

const ANIMATION_GENRE_ID = 16;

export async function getCatalogList(mediaType, category, page = 1) {
  if (category === "animation") {
    const data = await tmdbFetch(`/discover/${mediaType}`, {
      with_genres: ANIMATION_GENRE_ID,
      sort_by: "popularity.desc",
      page,
    });
    if (!data) return [];
    return data.results.map((r) => mapTitle(r, mediaType));
  }

  const endpoint = LIST_ENDPOINTS[mediaType]?.[category];
  if (!endpoint) {
    throw new Error(`Unsupported category "${category}" for ${mediaType}`);
  }
  const data = await tmdbFetch(endpoint, { page });
  if (!data) return [];
  return data.results.map((r) => mapTitle(r, mediaType));
}

export async function getAnime() {
  const [movies, shows] = await Promise.all([
    tmdbFetch("/discover/movie", {
      with_genres: ANIMATION_GENRE_ID,
      with_origin_country: "JP",
      sort_by: "popularity.desc",
    }),
    tmdbFetch("/discover/tv", {
      with_genres: ANIMATION_GENRE_ID,
      with_origin_country: "JP",
      sort_by: "popularity.desc",
    }),
  ]);
  if (!movies || !shows) return [];
  const combined = [
    ...movies.results.map((r) => mapTitle(r, "movie")),
    ...shows.results.map((r) => mapTitle(r, "tv")),
  ];
  combined.sort((a, b) => b.voteAverage - a.voteAverage);
  return combined;
}

export async function getGenres(mediaType) {
  const data = await tmdbFetch(`/genre/${mediaType}/list`);
  return data?.genres || [];
}

export async function searchCatalog(query) {
  const data = await tmdbFetch("/search/multi", { query });
  if (!data) return [];
  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => mapTitle(r));
}

export async function getTvSeason(showId, seasonNumber) {
  const data = await tmdbFetch(`/tv/${showId}/season/${seasonNumber}`);
  if (!data) return [];
  return data.episodes.map((ep) => ({
    id: ep.id,
    episodeNumber: ep.episode_number,
    name: ep.name,
    overview: ep.overview,
    stillPath: ep.still_path ? `${IMAGE_BASE}/w300${ep.still_path}` : null,
    airDate: ep.air_date,
    runtime: ep.runtime,
  }));
}

export async function getTitleLogo(mediaType, id) {
  try {
    const data = await tmdbFetch(`/${mediaType}/${id}/images`);
    if (!data) return { logoPath: null };
    const logos = data.logos || [];
    const logo = logos.find((l) => l.iso_639_1 === "en") || logos[0] || null;
    return { logoPath: logo ? `${IMAGE_BASE}/w500${logo.file_path}` : null };
  } catch {
    return { logoPath: null };
  }
}

export async function getTitleVideos(mediaType, id) {
  try {
    const data = await tmdbFetch(`/${mediaType}/${id}/videos`);
    if (!data) return { key: null };
    const yt = data.results.filter((v) => v.site === "YouTube");
    const trailer =
      yt.find((v) => v.type === "Trailer" && v.official) ||
      yt.find((v) => v.type === "Trailer") ||
      yt.find((v) => v.type === "Teaser") ||
      yt[0] ||
      null;
    return { key: trailer?.key || null };
  } catch {
    return { key: null };
  }
}

export async function getTitleDetail(mediaType, id) {
  const raw = await tmdbFetch(`/${mediaType}/${id}?append_to_response=credits,videos,similar`);
  if (!raw) return null;
  const base = mapTitle(raw, mediaType);
  return {
    ...base,
    genres: raw.genres || [],
    runtimeMinutes: mediaType === "movie" ? raw.runtime || null : raw.episode_run_time?.[0] || null,
    numberOfSeasons: mediaType === "tv" ? raw.number_of_seasons || null : null,
    similar: (raw.similar?.results || []).map((r) => mapTitle(r, mediaType)),
    cast: (raw.credits?.cast || []).slice(0, 24).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path ? `${IMAGE_BASE}/w185${c.profile_path}` : null,
    })),
  };
}
