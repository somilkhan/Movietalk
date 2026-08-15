const ANILIST_URL = "https://graphql.anilist.co";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

async function anilistQuery(query, variables = {}) {
  const response = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`AniList HTTP ${response.status}`);
  const json = await response.json();
  if (json.errors?.length) throw new Error(json.errors[0].message || "AniList error");
  return json.data;
}

async function tmdbSearch(title, mediaType) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  const endpoint = mediaType === "movie" ? "/search/movie" : "/search/tv";
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", key);
  url.searchParams.set("query", title);
  url.searchParams.set("page", "1");
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

function titleFromTmdb(raw, mediaType) {
  if (!raw?.id) return null;
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

const MEDIA_FIELDS = `
  id
  type
  format
  title { romaji english native }
  startDate { year month day }
  endDate { year month day }
  episodes
  status
  averageScore
  popularity
  season
  seasonYear
  nextAiringEpisode { episode airingAt }
  externalLinks { site url }
`;

async function getMedia({ status, sort, format, startDateGreater }) {
  const query = `query($status: MediaStatus, $sort: [MediaSort], $format: MediaFormat, $startDateGreater: FuzzyDateInt) {
    Page(page: 1, perPage: 30) {
      media(type: ANIME, status: $status, sort: $sort, format: $format, startDate_greater: $startDateGreater) {
        ${MEDIA_FIELDS}
      }
    }
  }`;
  const data = await anilistQuery(query, {
    status: status || null,
    sort: sort || ["POPULARITY_DESC"],
    format: format || null,
    startDateGreater: startDateGreater || null,
  });
  return data?.Page?.media || [];
}

function displayName(media) {
  return media.title?.english || media.title?.romaji || media.title?.native || "Untitled";
}

async function resolveMedia(media, cache) {
  const tmdbLink = media.externalLinks?.find((link) => link.site === "TMDB");
  if (tmdbLink) {
    const match = tmdbLink.url.match(/(?:movie|tv)\/(\d+)/i);
    if (match) {
      const mediaType = /\/tv\//i.test(tmdbLink.url) ? "tv" : "movie";
      const key = `${mediaType}:${match[1]}`;
      if (cache.has(key)) return cache.get(key);
      const value = { id: Number(match[1]), mediaType, title: displayName(media), posterPath: null, backdropPath: null, overview: "", voteAverage: (media.averageScore || 0) / 10, year: media.startDate?.year ? String(media.startDate.year) : null, genreIds: [] };
      cache.set(key, value);
      return value;
    }
  }

  const mediaType = media.format === "MOVIE" ? "movie" : "tv";
  const cacheKey = `search:${mediaType}:${displayName(media).toLowerCase()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const raw = await tmdbSearch(displayName(media), mediaType);
  const value = titleFromTmdb(raw, mediaType);
  if (value) {
    value.title = displayName(media);
    if (media.averageScore) value.voteAverage = media.averageScore / 10;
  }
  cache.set(cacheKey, value);
  return value;
}

async function resolveList(list, cache) {
  const resolved = [];
  for (const media of list) {
    const title = await resolveMedia(media, cache);
    if (title) resolved.push(title);
  }
  return resolved;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  try {
    const cache = new Map();
    const [trending, airing, upcoming, topRated, series, movies, latest] = await Promise.all([
      getMedia({ sort: ["TRENDING_DESC"] }),
      getMedia({ status: "RELEASING", sort: ["POPULARITY_DESC"] }),
      getMedia({ status: "NOT_YET_RELEASED", sort: ["START_DATE"] }),
      getMedia({ sort: ["SCORE_DESC"] }),
      getMedia({ format: "TV", sort: ["POPULARITY_DESC"] }),
      getMedia({ format: "MOVIE", sort: ["POPULARITY_DESC"] }),
      getMedia({ sort: ["START_DATE_DESC"] }),
    ]);

    const [trendingTitles, airingTitles, upcomingTitles, topRatedTitles, seriesTitles, movieTitles, latestTitles] = await Promise.all([
      resolveList(trending, cache),
      resolveList(airing, cache),
      resolveList(upcoming, cache),
      resolveList(topRated, cache),
      resolveList(series, cache),
      resolveList(movies, cache),
      resolveList(latest, cache),
    ]);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      featured: trendingTitles.slice(0, 8),
      trending: trendingTitles.slice(0, 12),
      airing: airingTitles.slice(0, 12),
      upcoming: upcomingTitles.slice(0, 12),
      topRated: topRatedTitles.slice(0, 12),
      series: seriesTitles.slice(0, 12),
      movies: movieTitles.slice(0, 12),
      latest: latestTitles.slice(0, 12),
    }));
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "AniList unavailable" }));
  }
}
