import https from "https";
import http from "http";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";
const ANIMATION_GENRE_ID = 16;
const CINEPRO_URL = process.env.CINEPRO_URL || "";

const users = new Map();
const sessions = new Map();
const watchlists = new Map();
const ratingsStore = new Map();
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

function randomUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function createSession(userId, email) {
  const sessionId = randomUUID();
  sessions.set(sessionId, { userId, email, expiresAt: Date.now() + SESSION_TTL });
  return sessionId;
}

function getSession(sessionId) {
  if (!sessionId) return null;
  const s = sessions.get(sessionId);
  if (!s || s.expiresAt < Date.now()) {
    if (s) sessions.delete(sessionId);
    return null;
  }
  return s;
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

// ── HTTP client ─────────────────────────────────────────────────────────────

function httpsRequest(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const client = urlStr.startsWith("https:") ? https : http;
    const req = client.get(urlStr, options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString(),
        });
      });
    });
    req.on("error", (err) => reject(err));
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

async function httpGet(urlStr, options = {}) {
  if (typeof fetch !== "undefined") {
    try {
      const res = await fetch(urlStr, options);
      const text = await res.text();
      return { status: res.status, body: text };
    } catch {
      // fall through
    }
  }
  return httpsRequest(urlStr, options);
}

async function tmdbFetch(path, params) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", key);
  for (const [k, value] of Object.entries(params || {})) {
    if (value !== undefined) url.searchParams.set(k, String(value));
  }
  try {
    const res = await httpGet(url.toString());
    if (res.status >= 400) return null;
    return JSON.parse(res.body);
  } catch {
    return null;
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
    req.on("error", reject);
  });
}

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  const cookies = {};
  raw.split(";").forEach((c) => {
    const [k, v] = c.trim().split("=");
    if (k) cookies[k] = v;
  });
  return cookies;
}

function setCookie(res, name, value, maxAge) {
  const existing = res.getHeader("Set-Cookie") || [];
  const arr = Array.isArray(existing) ? existing : [existing];
  arr.push(`${name}=${value}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Path=/`);
  res.setHeader("Set-Cookie", arr);
}

function clearCookie(res, name) {
  const existing = res.getHeader("Set-Cookie") || [];
  const arr = Array.isArray(existing) ? existing : [existing];
  arr.push(`${name}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`);
  res.setHeader("Set-Cookie", arr);
}

// ── Safe response helpers ───────────────────────────────────────────────────

function safeJson(res, data) {
  try {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    }
  } catch (e) {
    try { res.end(JSON.stringify({ error: "Response failed" })); } catch {}
  }
}

function safeStatus(res, code) {
  try {
    if (!res.headersSent) res.statusCode = code;
  } catch {}
  return res;
}

// ── Main handler ────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cookie, Range");
  res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range");
  if (req.method === "OPTIONS") {
    safeStatus(res, 200);
    res.end();
    return;
  }

  try {
    // Parse URL safely
    let pathname = "/";
    let search = "";
    try {
      const rawUrl = req.url || "/";
      const urlObj = rawUrl.startsWith("http")
        ? new URL(rawUrl)
        : new URL(rawUrl, `http://${req.headers.host || "localhost"}`);
      pathname = urlObj.pathname || "/";
      search = urlObj.search || "";
    } catch (e) {
      pathname = "/";
      search = "";
    }

    // Strip /api prefix if present
    const path = pathname.replace(/^\/api/, "").replace(/\/$/, "") || "/";

    // Parse query
    const query = {};
    try {
      const sp = new URLSearchParams(search);
      sp.forEach((v, k) => { query[k] = v; });
    } catch {}

    const body = req.method === "POST" || req.method === "PATCH" || req.method === "DELETE"
      ? await parseBody(req)
      : {};
    const cookies = parseCookies(req);
    const region = query.region || "IN";

    // ── Routes ──────────────────────────────────────────────────────────────

    if (path === "/health") {
      safeJson(res, { status: "ok", time: Date.now() });
      return;
    }

    if (path === "/debug") {
      safeJson(res, {
        tmdbKeySet: !!process.env.TMDB_API_KEY,
        tmdbKeyLength: process.env.TMDB_API_KEY ? process.env.TMDB_API_KEY.length : 0,
        nodeEnv: process.env.NODE_ENV || "not set",
        hasFetch: typeof fetch !== "undefined",
        path,
        pathname,
        region,
      });
      return;
    }

    if (path === "/test-tmdb") {
      const key = process.env.TMDB_API_KEY;
      if (!key) {
        safeJson(res, { ok: false, error: "No TMDB key" });
        return;
      }
      const testUrl = `${TMDB_BASE}/movie/popular?api_key=${key}&page=1`;
      try {
        const result = await httpGet(testUrl);
        const parsed = JSON.parse(result.body);
        safeJson(res, {
          ok: true,
          status: result.status,
          resultCount: Array.isArray(parsed.results) ? parsed.results.length : 0,
          firstTitle: parsed.results?.[0]?.title || null,
        });
      } catch (err) {
        safeJson(res, { ok: false, error: err.message });
      }
      return;
    }

    // Auth
    if (path === "/auth/register" && req.method === "POST") {
      const { email, password, username } = body;
      if (!email || !password || !username) { safeStatus(res, 400); safeJson(res, { error: "Missing fields" }); return; }
      if (!/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(email)) { safeStatus(res, 400); safeJson(res, { error: "Invalid email" }); return; }
      if (password.length < 8) { safeStatus(res, 400); safeJson(res, { error: "Password too short" }); return; }
      if (users.has(email)) { safeStatus(res, 409); safeJson(res, { error: "Email exists" }); return; }
      const id = randomUUID();
      users.set(email, { id, email, username, passwordHash: password });
      const sessionId = createSession(id, email);
      setCookie(res, "sessionId", sessionId, SESSION_TTL / 1000);
      safeStatus(res, 201);
      safeJson(res, { id, email, username });
      return;
    }

    if (path === "/auth/login" && req.method === "POST") {
      const { email, password } = body;
      if (!email || !password) { safeStatus(res, 400); safeJson(res, { error: "Missing fields" }); return; }
      const user = users.get(email);
      if (!user || user.passwordHash !== password) { safeStatus(res, 401); safeJson(res, { error: "Invalid credentials" }); return; }
      const sessionId = createSession(user.id, user.email);
      setCookie(res, "sessionId", sessionId, SESSION_TTL / 1000);
      safeJson(res, { id: user.id, email: user.email, username: user.username });
      return;
    }

    if (path === "/auth/logout" && req.method === "POST") {
      const sid = cookies.sessionId;
      if (sid) sessions.delete(sid);
      clearCookie(res, "sessionId");
      safeJson(res, { success: true });
      return;
    }

    if (path === "/auth/me" && req.method === "GET") {
      const session = getSession(cookies.sessionId);
      if (!session) { safeStatus(res, 401); safeJson(res, { error: "Not authenticated" }); return; }
      safeJson(res, { id: session.userId, email: session.email });
      return;
    }

    // Watchlist
    if (path === "/watchlist" && req.method === "GET") {
      const sid = query.sessionId;
      if (!sid) { safeStatus(res, 400); safeJson(res, { error: "sessionId required" }); return; }
      safeJson(res, watchlists.get(sid) || []);
      return;
    }

    if (path === "/watchlist" && req.method === "POST") {
      const { sessionId: sid, titleId, mediaType, titleSnapshot } = body;
      if (!sid || !titleId || !mediaType || typeof titleSnapshot !== "object") { safeStatus(res, 400); safeJson(res, { error: "Invalid body" }); return; }
      const list = watchlists.get(sid) || [];
      if (!list.find((x) => x.titleId === titleId && x.mediaType === mediaType)) {
        list.push({ titleId, mediaType, titleSnapshot, addedAt: new Date().toISOString() });
        watchlists.set(sid, list);
      }
      safeJson(res, { ok: true });
      return;
    }

    const watchlistDelMatch = path.match(/^\/watchlist\/(movie|tv)\/(\d+)$/);
    if (watchlistDelMatch && req.method === "DELETE") {
      const [, mediaType, titleId] = watchlistDelMatch;
      const sid = query.sessionId;
      if (!sid) { safeStatus(res, 400); safeJson(res, { error: "sessionId required" }); return; }
      const list = watchlists.get(sid) || [];
      watchlists.set(sid, list.filter((x) => !(x.titleId === Number(titleId) && x.mediaType === mediaType)));
      safeJson(res, { ok: true });
      return;
    }

    const watchlistGetMatch = path.match(/^\/watchlist\/(movie|tv)\/(\d+)$/);
    if (watchlistGetMatch && req.method === "GET") {
      const [, mediaType, titleId] = watchlistGetMatch;
      const sid = query.sessionId;
      if (!sid) { safeStatus(res, 400); safeJson(res, { error: "sessionId required" }); return; }
      const list = watchlists.get(sid) || [];
      const found = list.find((x) => x.titleId === Number(titleId) && x.mediaType === mediaType);
      safeJson(res, { inWatchlist: !!found });
      return;
    }

    // Ratings
    if (path === "/ratings" && req.method === "GET") {
      const sid = query.sessionId;
      if (!sid) { safeStatus(res, 400); safeJson(res, { error: "sessionId required" }); return; }
      safeJson(res, ratingsStore.get(sid) || []);
      return;
    }

    if (path === "/ratings" && req.method === "POST") {
      const { sessionId: sid, titleId, mediaType, rating, titleSnapshot } = body;
      if (!sid || !titleId || !mediaType || !rating || typeof titleSnapshot !== "object") { safeStatus(res, 400); safeJson(res, { error: "Invalid body" }); return; }
      const list = ratingsStore.get(sid) || [];
      const idx = list.findIndex((x) => x.titleId === titleId && x.mediaType === mediaType);
      const entry = { titleId, mediaType, rating, titleSnapshot, ratedAt: new Date().toISOString() };
      if (idx >= 0) list[idx] = entry;
      else list.push(entry);
      ratingsStore.set(sid, list);
      safeJson(res, { ok: true });
      return;
    }

    const ratingsDelMatch = path.match(/^\/ratings\/(movie|tv)\/(\d+)$/);
    if (ratingsDelMatch && req.method === "DELETE") {
      const [, mediaType, titleId] = ratingsDelMatch;
      const sid = query.sessionId;
      if (!sid) { safeStatus(res, 400); safeJson(res, { error: "sessionId required" }); return; }
      const list = ratingsStore.get(sid) || [];
      ratingsStore.set(sid, list.filter((x) => !(x.titleId === Number(titleId) && x.mediaType === mediaType)));
      safeJson(res, { ok: true });
      return;
    }

    const ratingsGetMatch = path.match(/^\/ratings\/(movie|tv)\/(\d+)$/);
    if (ratingsGetMatch && req.method === "GET") {
      const [, mediaType, titleId] = ratingsGetMatch;
      const sid = query.sessionId;
      if (!sid) { safeStatus(res, 400); safeJson(res, { error: "sessionId required" }); return; }
      const list = ratingsStore.get(sid) || [];
      const found = list.find((x) => x.titleId === Number(titleId) && x.mediaType === mediaType);
      safeJson(res, { rating: found ? found.rating : null });
      return;
    }

    // ── Catalog ─────────────────────────────────────────────────────────────

    if (path === "/catalog/trending") {
      const mediaType = query.mediaType || "all";
      const window = query.window || "week";
      const page = query.page || "1";
      const data = await tmdbFetch(`/trending/${mediaType}/${window}`, { page, region });
      if (!data) { safeStatus(res, 500); safeJson(res, { error: "TMDB error" }); return; }
      const results = (data.results || []).filter((r) => r.media_type !== "person").map((r) => mapTitle(r, mediaType === "all" ? undefined : mediaType));
      safeJson(res, results);
      return;
    }

    if (path === "/catalog/list") {
      const mediaType = query.mediaType || "movie";
      const category = query.category || "popular";
      const page = query.page || "1";

      if (category === "animation") {
        const data = await tmdbFetch(`/discover/${mediaType}`, { with_genres: ANIMATION_GENRE_ID, sort_by: "popularity.desc", page, region });
        safeJson(res, (data?.results || []).map((r) => mapTitle(r, mediaType)));
        return;
      }

      if (region && region !== "US") {
        const sortBy = category === "top_rated" ? "vote_average.desc" : "popularity.desc";
        const params = { sort_by: sortBy, with_origin_country: region, page };
        if (category === "top_rated") params["vote_count.gte"] = 100;
        const data = await tmdbFetch(`/discover/${mediaType}`, params);
        safeJson(res, (data?.results || []).map((r) => mapTitle(r, mediaType)));
        return;
      }

      const endpoints = {
        movie: { popular: "/movie/popular", top_rated: "/movie/top_rated", now_playing: "/movie/now_playing" },
        tv: { popular: "/tv/popular", top_rated: "/tv/top_rated", on_the_air: "/tv/on_the_air" },
      };
      const endpoint = endpoints[mediaType]?.[category];
      if (!endpoint) { safeStatus(res, 400); safeJson(res, { error: "Invalid category" }); return; }
      const data = await tmdbFetch(endpoint, { page, region });
      safeJson(res, (data?.results || []).map((r) => mapTitle(r, mediaType)));
      return;
    }

    if (path === "/catalog/regional") {
      const mediaType = query.mediaType || "movie";
      const country = query.country || "IN";
      const page = query.page || "1";
      const data = await tmdbFetch(`/discover/${mediaType}`, { with_origin_country: country, sort_by: "popularity.desc", page });
      safeJson(res, (data?.results || []).map((r) => mapTitle(r, mediaType)));
      return;
    }

    if (path === "/catalog/language") {
      const mediaType = query.mediaType || "movie";
      const language = query.language || "hi";
      const page = query.page || "1";
      const data = await tmdbFetch(`/discover/${mediaType}`, { with_original_language: language, sort_by: "popularity.desc", page });
      safeJson(res, (data?.results || []).map((r) => mapTitle(r, mediaType)));
      return;
    }

    if (path === "/catalog/anime/airing") {
      const page = query.page || "1";
      const data = await tmdbFetch("/tv/on_the_air", { page, region });
      const results = (data?.results || [])
        .filter((r) => r.genre_ids?.includes(ANIMATION_GENRE_ID) && r.origin_country?.includes("JP"))
        .map((r) => mapTitle(r, "tv"));
      safeJson(res, results);
      return;
    }

    if (path === "/catalog/anime/upcoming") {
      const page = query.page || "1";
      const today = new Date().toISOString().slice(0, 10);
      const future = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const data = await tmdbFetch("/discover/tv", {
        with_genres: ANIMATION_GENRE_ID,
        with_origin_country: "JP",
        first_air_date_gte: today,
        first_air_date_lte: future,
        sort_by: "first_air_date.asc",
        page,
      });
      safeJson(res, (data?.results || []).map((r) => mapTitle(r, "tv")));
      return;
    }

    if (path === "/catalog/anime") {
      const [movies, shows] = await Promise.all([
        tmdbFetch("/discover/movie", { with_genres: ANIMATION_GENRE_ID, with_origin_country: "JP", sort_by: "popularity.desc" }),
        tmdbFetch("/discover/tv", { with_genres: ANIMATION_GENRE_ID, with_origin_country: "JP", sort_by: "popularity.desc" }),
      ]);
      const combined = [
        ...((movies?.results || []).map((r) => mapTitle(r, "movie"))),
        ...((shows?.results || []).map((r) => mapTitle(r, "tv"))),
      ];
      combined.sort((a, b) => b.voteAverage - a.voteAverage);
      safeJson(res, combined);
      return;
    }

    if (path === "/catalog/search") {
      const q = query.query || "";
      const data = await tmdbFetch("/search/multi", { query: q, region });
      safeJson(res, (data?.results || []).filter((r) => r.media_type === "movie" || r.media_type === "tv").map((r) => mapTitle(r)));
      return;
    }

    if (path === "/catalog/genres") {
      const mediaType = query.mediaType || "movie";
      const data = await tmdbFetch(`/genre/${mediaType}/list`);
      safeJson(res, data?.genres || []);
      return;
    }

    const titleMatch = path.match(/^\/catalog\/title\/(movie|tv)\/(\d+)$/);
    if (titleMatch) {
      const [, mediaType, id] = titleMatch;
      const append = mediaType === "movie" ? "credits,videos,similar,release_dates" : "credits,videos,similar,content_ratings";
      const raw = await tmdbFetch(`/${mediaType}/${id}?append_to_response=${append}`);
      if (!raw) { safeStatus(res, 404); safeJson(res, { error: "Not found" }); return; }
      const base = mapTitle(raw, mediaType);
      let certification = null;
      if (mediaType === "movie" && raw.release_dates?.results) {
        const us = raw.release_dates.results.find((r) => r.iso_3166_1 === "US");
        certification = us?.release_dates?.[0]?.certification || null;
      } else if (mediaType === "tv" && raw.content_ratings?.results) {
        const us = raw.content_ratings.results.find((r) => r.iso_3166_1 === "US");
        certification = us?.rating || null;
      }
      safeJson(res, {
        ...base,
        genres: raw.genres || [],
        runtimeMinutes: raw.runtime || (raw.episode_run_time?.[0]) || null,
        numberOfSeasons: raw.number_of_seasons || null,
        certification,
        similar: (raw.similar?.results || []).map((r) => mapTitle(r, mediaType)),
        cast: (raw.credits?.cast || []).map((c) => ({ id: c.id, name: c.name, character: c.character, profilePath: c.profile_path ? `${IMAGE_BASE}/w200${c.profile_path}` : null })),
      });
      return;
    }

    const videosMatch = path.match(/^\/catalog\/title\/(movie|tv)\/(\d+)\/videos$/);
    if (videosMatch) {
      const [, mediaType, id] = videosMatch;
      const data = await tmdbFetch(`/${mediaType}/${id}/videos`);
      const yt = (data?.results || []).filter((v) => v.site === "YouTube");
      const trailer = yt.find((v) => v.type === "Trailer" && v.official) || yt.find((v) => v.type === "Trailer") || yt.find((v) => v.type === "Teaser") || yt[0] || null;
      safeJson(res, { key: trailer?.key || null });
      return;
    }

    const trailerMatch = path.match(/^\/catalog\/title\/(movie|tv)\/(\d+)\/trailer$/);
    if (trailerMatch) {
      const [, mediaType, id] = trailerMatch;
      const data = await tmdbFetch(`/${mediaType}/${id}/videos`);
      const yt = (data?.results || []).filter((v) => v.site === "YouTube");
      const trailer = yt.find((v) => v.type === "Trailer" && v.official) || yt.find((v) => v.type === "Trailer") || yt.find((v) => v.type === "Teaser") || yt[0] || null;
      safeJson(res, { key: trailer?.key || null });
      return;
    }

    const logoMatch = path.match(/^\/catalog\/title\/(movie|tv)\/(\d+)\/logo$/);
    if (logoMatch) {
      const [, mediaType, id] = logoMatch;
      const data = await tmdbFetch(`/${mediaType}/${id}/images`);
      const logos = data?.logos || [];
      const logo = logos.find((l) => l.iso_639_1 === "en") || logos[0] || null;
      safeJson(res, { logoPath: logo ? `${IMAGE_BASE}/w500${logo.file_path}` : null });
      return;
    }

    const seasonMatch = path.match(/^\/catalog\/tv\/(\d+)\/season\/(\d+)$/);
    if (seasonMatch) {
      const [, showId, seasonNumber] = seasonMatch;
      const data = await tmdbFetch(`/tv/${showId}/season/${seasonNumber}`);
      safeJson(res, (data?.episodes || []).map((ep) => ({
        id: ep.id,
        episodeNumber: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        stillPath: ep.still_path ? `${IMAGE_BASE}/w300${ep.still_path}` : null,
        airDate: ep.air_date,
        runtime: ep.runtime,
      })));
      return;
    }

    // Stream
    const streamMovieMatch = path.match(/^\/stream\/movie\/(\d+)$/);
    if (streamMovieMatch && req.method === "GET") {
      const [, id] = streamMovieMatch;
      if (!CINEPRO_URL) { safeStatus(res, 503); safeJson(res, { error: "Stream unavailable", sources: [], subtitles: [] }); return; }
      try {
        const upstream = await httpGet(`${CINEPRO_URL}/v1/movies/${id}`, { headers: { Accept: "application/json" } });
        const data = JSON.parse(upstream.body);
        safeStatus(res, upstream.status);
        safeJson(res, data);
      } catch { safeStatus(res, 503); safeJson(res, { error: "Stream unavailable", sources: [], subtitles: [] }); }
      return;
    }

    const streamTvMatch = path.match(/^\/stream\/tv\/(\d+)\/season\/(\d+)\/episode\/(\d+)$/);
    if (streamTvMatch && req.method === "GET") {
      const [, id, s, e] = streamTvMatch;
      if (!CINEPRO_URL) { safeStatus(res, 503); safeJson(res, { error: "Stream unavailable", sources: [], subtitles: [] }); return; }
      try {
        const upstream = await httpGet(`${CINEPRO_URL}/v1/tv/${id}/seasons/${s}/episodes/${e}`, { headers: { Accept: "application/json" } });
        const data = JSON.parse(upstream.body);
        safeStatus(res, upstream.status);
        safeJson(res, data);
      } catch { safeStatus(res, 503); safeJson(res, { error: "Stream unavailable", sources: [], subtitles: [] }); }
      return;
    }

    // Proxy
    if (path === "/proxy") {
      const rawUrl = query.url;
      if (!rawUrl) { safeStatus(res, 400); res.end("Missing url"); return; }
      let parsedUrl;
      try { parsedUrl = new URL(rawUrl); } catch { safeStatus(res, 400); res.end("Invalid url"); return; }
      if (!["http:", "https:"].includes(parsedUrl.protocol)) { safeStatus(res, 400); res.end("Protocol not allowed"); return; }
      try {
        const headers = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          Referer: parsedUrl.origin + "/",
          Origin: parsedUrl.origin,
          Accept: "*/*",
        };
        if (req.headers.range) headers["Range"] = req.headers.range;
        const upstream = await httpGet(rawUrl, { headers });
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Range");
        res.setHeader("Access-Control-Expose-Headers", "Content-Length,Content-Range");
        if (upstream.headers && upstream.headers["content-type"]) res.setHeader("Content-Type", upstream.headers["content-type"]);
        if (upstream.headers && upstream.headers["content-length"]) res.setHeader("Content-Length", upstream.headers["content-length"]);
        if (upstream.headers && upstream.headers["content-range"]) res.setHeader("Content-Range", upstream.headers["content-range"]);
        safeStatus(res, upstream.status);
        res.end(Buffer.from(upstream.body));
      } catch { safeStatus(res, 502); res.end("Proxy error"); }
      return;
    }

    // 404
    safeStatus(res, 404);
    safeJson(res, { error: "Not found", path });

  } catch (err) {
    try {
      safeStatus(res, 500);
      safeJson(res, { error: "Internal error", message: String(err && err.message ? err.message : err) });
    } catch {
      try { res.statusCode = 500; res.end("Internal Server Error"); } catch {}
    }
  }
}
