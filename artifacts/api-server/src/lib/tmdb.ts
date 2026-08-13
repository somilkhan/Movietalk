import { logger } from "./logger";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export type MediaType = "movie" | "tv";

export interface Genre {
  id: number;
  name: string;
}

export interface Title {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  voteAverage: number;
  year: string | null;
  genreIds: number[];
}

export interface TitleDetail extends Title {
  genres: Genre[];
  runtimeMinutes: number | null;
  numberOfSeasons: number | null;
  certification: string | null;
  similar: Title[];
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profilePath: string | null;
  }>;
}

interface RawResult {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

function apiKey(): string | null {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    logger.warn("TMDB_API_KEY not set — returning empty data");
    return null;
  }
  return key;
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T | null> {
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
    logger.error({ status: res.status, path, body }, "TMDB request failed");
    return null;
  }
  return (await res.json()) as T;
}

function mapTitle(raw: RawResult, fallbackMediaType?: MediaType): Title {
  const mediaType: MediaType =
    (raw.media_type as MediaType | undefined) ?? fallbackMediaType ?? "movie";
  const date = raw.release_date || raw.first_air_date || null;
  return {
    id: raw.id,
    mediaType,
    title: raw.title || raw.name || "Untitled",
    posterPath: raw.poster_path ? `${IMAGE_BASE}/w500${raw.poster_path}` : null,
    backdropPath: raw.backdrop_path
      ? `${IMAGE_BASE}/original${raw.backdrop_path}`
      : null,
    overview: raw.overview ?? "",
    voteAverage: raw.vote_average ?? 0,
    year: date ? date.slice(0, 4) : null,
    genreIds: raw.genre_ids ?? [],
  };
}

export async function getTrending(
  mediaType: "all" | MediaType,
  window: "day" | "week",
  page = 1,
  region?: string,
): Promise<Title[]> {
  const data = await tmdbFetch<{ results: RawResult[] }>(
    `/trending/${mediaType}/${window}`,
    { page, region },
  );
  if (!data) return [];
  return data.results
    .filter((r) => r.media_type !== "person")
    .map((r) => mapTitle(r, mediaType === "all" ? undefined : mediaType));
}

const LIST_ENDPOINTS: Record<
  MediaType,
  Partial<Record<string, string>>
> = {
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

export async function getCatalogList(
  mediaType: MediaType,
  category: string,
  page = 1,
  region = "IN",
): Promise<Title[]> {
  if (category === "animation") {
    const data = await tmdbFetch<{ results: RawResult[] }>(
      `/discover/${mediaType}`,
      {
        with_genres: ANIMATION_GENRE_ID,
        sort_by: "popularity.desc",
        page,
        region,
      },
    );
    if (!data) return [];
    return data.results.map((r) => mapTitle(r, mediaType));
  }

  // For non-US regions, use /discover with origin country filter
  // because /movie/popular and /tv/popular don't effectively filter by region
  if (region && region !== "US") {
    const sortBy = category === "top_rated" ? "vote_average.desc" : "popularity.desc";
    const voteCountGte = category === "top_rated" ? 100 : undefined;

    const data = await tmdbFetch<{ results: RawResult[] }>(
      `/discover/${mediaType}`,
      {
        sort_by: sortBy,
        with_origin_country: region,
        ...(voteCountGte ? { "vote_count.gte": voteCountGte } : {}),
        page,
      },
    );
    if (!data) return [];
    return data.results.map((r) => mapTitle(r, mediaType));
  }

  const endpoint = LIST_ENDPOINTS[mediaType][category];
  if (!endpoint) {
    throw new Error(`Unsupported category "${category}" for ${mediaType}`);
  }
  const data = await tmdbFetch<{ results: RawResult[] }>(endpoint, { page, region });
  if (!data) return [];
  return data.results.map((r) => mapTitle(r, mediaType));
}

export async function getGenres(mediaType: MediaType): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>(
    `/genre/${mediaType}/list`,
  );
  return data?.genres ?? [];
}

export async function searchCatalog(query: string, region = "IN"): Promise<Title[]> {
  const data = await tmdbFetch<{ results: RawResult[] }>("/search/multi", {
    query,
    region,
  });
  if (!data) return [];
  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => mapTitle(r));
}

/** Get content filtered by origin country (e.g. IN for India) */
export async function getRegionalContent(
  mediaType: MediaType,
  country: string,
  page = 1,
): Promise<Title[]> {
  const data = await tmdbFetch<{ results: RawResult[] }>(
    `/discover/${mediaType}`,
    {
      with_origin_country: country,
      sort_by: "popularity.desc",
      page,
    },
  );
  if (!data) return [];
  return data.results.map((r) => mapTitle(r, mediaType));
}

/** Get content by original language */
export async function getContentByLanguage(
  mediaType: MediaType,
  language: string,
  page = 1,
): Promise<Title[]> {
  const data = await tmdbFetch<{ results: RawResult[] }>(
    `/discover/${mediaType}`,
    {
      with_original_language: language,
      sort_by: "popularity.desc",
      page,
    },
  );
  if (!data) return [];
  return data.results.map((r) => mapTitle(r, mediaType));
}

export interface Episode {
  id: number;
  episodeNumber: number;
  name: string;
  overview: string;
  stillPath: string | null;
  airDate: string | null;
  runtime: number | null;
}

export async function getTvSeason(
  showId: number,
  seasonNumber: number,
): Promise<Episode[]> {
  const data = await tmdbFetch<{
    episodes: Array<{
      id: number;
      episode_number: number;
      name: string;
      overview: string;
      still_path: string | null;
      air_date: string | null;
      runtime: number | null;
    }>;
  }>(`/tv/${showId}/season/${seasonNumber}`);

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

export async function getTitleLogo(
  mediaType: MediaType,
  id: number,
): Promise<{ logoPath: string | null }> {
  try {
    const data = await tmdbFetch<{
      logos: Array<{
        file_path: string;
        iso_639_1: string;
      }>;
    }>(`/${mediaType}/${id}/images`);

    if (!data) return { logoPath: null };
    const logos = data.logos ?? [];
    const logo =
      logos.find((l) => l.iso_639_1 === "en") ??
      logos[0] ??
      null;

    return { logoPath: logo ? `${IMAGE_BASE}/w500${logo.file_path}` : null };
  } catch {
    return { logoPath: null };
  }
}

export async function getTitleVideos(
  mediaType: MediaType,
  id: number,
): Promise<{ key: string | null }> {
  try {
    const data = await tmdbFetch<{
      results: Array<{
        key: string;
        site: string;
        type: string;
        official: boolean;
      }>;
    }>(`/${mediaType}/${id}/videos`);

    if (!data) return { key: null };
    const yt = data.results.filter((v) => v.site === "YouTube");
    const trailer =
      yt.find((v) => v.type === "Trailer" && v.official) ??
      yt.find((v) => v.type === "Trailer") ??
      yt.find((v) => v.type === "Teaser") ??
      yt[0] ??
      null;

    return { key: trailer?.key ?? null };
  } catch {
    return { key: null };
  }
}

export async function getTitleDetail(
  mediaType: MediaType,
  id: number,
): Promise<TitleDetail | null> {
  const append = mediaType === "movie"
    ? "credits,videos,similar,release_dates"
    : "credits,videos,similar,content_ratings";

  const raw = await tmdbFetch<
    RawResult & {
      genres?: Genre[];
      runtime?: number;
      episode_run_time?: number[];
      number_of_seasons?: number;
      release_dates?: {
        results?: Array<{
          iso_3166_1: string;
          release_dates?: Array<{ certification?: string }>;
        }>;
      };
      content_ratings?: {
        results?: Array<{ iso_3166_1: string; rating?: string }>;
      };
      similar?: { results: RawResult[] };
      credits?: {
        cast?: Array<{
          id: number;
          name: string;
          character: string;
          profile_path?: string | null;
        }>;
      };
    }
  >(`/${mediaType}/${id}?append_to_response=${append}`);

  if (!raw) return null;
  const base = mapTitle(raw, mediaType);

  let certification: string | null = null;
  if (mediaType === "movie" && raw.release_dates?.results) {
    const us = raw.release_dates.results.find((r) => r.iso_3166_1 === "US");
    certification = us?.release_dates?.[0]?.certification || null;
  } else if (mediaType === "tv" && raw.content_ratings?.results) {
    const us = raw.content_ratings.results.find((r) => r.iso_3166_1 === "US");
    certification = us?.rating || null;
  }

  return {
    ...base,
    genres: raw.genres ?? [],
    runtimeMinutes:
      mediaType === "movie"
        ? raw.runtime ?? null
        : raw.episode_run_time?.[0] ?? null,
    numberOfSeasons: mediaType === "tv" ? raw.number_of_seasons ?? null : null,
    certification,
    similar: (raw.similar?.results ?? []).map((r) => mapTitle(r, mediaType)),
    cast: (raw.credits?.cast ?? []).slice(0, 24).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path
        ? `${IMAGE_BASE}/w185${c.profile_path}`
        : null,
    })),
  };
}
