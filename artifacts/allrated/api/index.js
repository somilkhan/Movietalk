import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import * as tmdb from "./tmdb.js";

const app = express();

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:", "data:"],
      mediaSrc: ["'self'", "https:", "blob:"],
      connectSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many requests" });
  },
}));

// ── Health ──
app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Catalog ──
app.get("/api/catalog/trending", async (req, res) => {
  const mediaType = String(req.query.mediaType || "all");
  const window = String(req.query.window || "week");
  const page = Number(req.query.page) || 1;
  try {
    const results = await tmdb.getTrending(mediaType, window, page);
    res.json(results);
  } catch (err) {
    console.error("Trending error:", err);
    res.status(500).json([]);
  }
});

app.get("/api/catalog/list", async (req, res) => {
  const mediaType = String(req.query.mediaType || "movie");
  const category = String(req.query.category || "popular");
  const page = Number(req.query.page) || 1;
  try {
    const results = await tmdb.getCatalogList(mediaType, category, page);
    res.json(results);
  } catch (err) {
    console.error("Catalog list error:", err);
    res.status(500).json([]);
  }
});

app.get("/api/catalog/anime", async (_req, res) => {
  try {
    const results = await tmdb.getAnime();
    res.json(results);
  } catch (err) {
    console.error("Anime error:", err);
    res.status(500).json([]);
  }
});

app.get("/api/catalog/genres", async (req, res) => {
  const mediaType = String(req.query.mediaType || "movie");
  try {
    const results = await tmdb.getGenres(mediaType);
    res.json(results);
  } catch (err) {
    console.error("Genres error:", err);
    res.status(500).json([]);
  }
});

app.get("/api/catalog/search", async (req, res) => {
  const query = String(req.query.query || "");
  if (!query.trim()) {
    res.status(400).json([]);
    return;
  }
  try {
    const results = await tmdb.searchCatalog(query);
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json([]);
  }
});

app.get("/api/catalog/tv/:id/season/:season", async (req, res) => {
  const showId = Number(req.params.id);
  const seasonNumber = Number(req.params.season);
  if (!Number.isFinite(showId) || !Number.isFinite(seasonNumber)) {
    res.status(400).json({ error: "Invalid id or season" });
    return;
  }
  try {
    const episodes = await tmdb.getTvSeason(showId, seasonNumber);
    res.json(episodes);
  } catch (err) {
    console.error("TV season error:", err);
    res.status(404).json({ error: "Season not found" });
  }
});

app.get("/api/catalog/title/:mediaType/:id/videos", async (req, res) => {
  const mediaType = req.params.mediaType;
  const id = Number(req.params.id);
  if (!["movie", "tv"].includes(mediaType) || !Number.isFinite(id)) {
    res.status(400).json({ key: null });
    return;
  }
  try {
    const result = await tmdb.getTitleVideos(mediaType, id);
    res.json(result);
  } catch (err) {
    console.error("Videos error:", err);
    res.json({ key: null });
  }
});

app.get("/api/catalog/title/:mediaType/:id/logo", async (req, res) => {
  const mediaType = req.params.mediaType;
  const id = Number(req.params.id);
  if (!["movie", "tv"].includes(mediaType) || !Number.isFinite(id)) {
    res.status(400).json({ logoPath: null });
    return;
  }
  try {
    const result = await tmdb.getTitleLogo(mediaType, id);
    res.json(result);
  } catch (err) {
    console.error("Logo error:", err);
    res.json({ logoPath: null });
  }
});

app.get("/api/catalog/title/:mediaType/:id", async (req, res) => {
  const mediaType = req.params.mediaType;
  const id = Number(req.params.id);
  if (!["movie", "tv"].includes(mediaType) || !Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  try {
    const detail = await tmdb.getTitleDetail(mediaType, id);
    if (!detail) {
      res.status(404).json({ error: "Title not found" });
      return;
    }
    res.json(detail);
  } catch (err) {
    console.error("Title detail error:", err);
    res.status(404).json({ error: "Title not found" });
  }
});

// ── Bingr proxy (avoids CORS in browser) ──
app.post("/api/bingr/stream", async (req, res) => {
  try {
    const upstream = await fetch("https://api.bingr.one/api/stream", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": "https://bingr.one",
        "Referer": "https://bingr.one/",
      },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(30_000),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error("Bingr proxy error:", err);
    res.status(502).json({ error: "Bingr API unreachable", sources: [], subtitles: [] });
  }
});

// ── Stream (proxy to CinePro) ──
const CINEPRO_URL = process.env.CINEPRO_URL || "http://localhost:3001";

async function proxyToCinePro(path) {
  const url = `${CINEPRO_URL}${path}`;
  return fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(55_000),
  });
}

app.get("/api/stream/movie/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const upstream = await proxyToCinePro(`/v1/movies/${id}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error("CinePro proxy error (movie):", err);
    res.status(503).json({
      error: "Stream service unavailable",
      sources: [],
      subtitles: [],
      diagnostics: [{ message: "CinePro Core is not running" }],
    });
  }
});

app.get("/api/stream/tv/:id/season/:s/episode/:e", async (req, res) => {
  const id = Number(req.params.id);
  const s = Number(req.params.s);
  const e = Number(req.params.e);
  if (!Number.isFinite(id) || !Number.isFinite(s) || !Number.isFinite(e)) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  try {
    const upstream = await proxyToCinePro(`/v1/tv/${id}/seasons/${s}/episodes/${e}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error("CinePro proxy error (tv):", err);
    res.status(503).json({
      error: "Stream service unavailable",
      sources: [],
      subtitles: [],
      diagnostics: [{ message: "CinePro Core is not running" }],
    });
  }
});

// ── Proxy (HLS segments) ──
const ALLOWED_PROTOCOLS = ["http:", "https:"];

app.get("/api/proxy", async (req, res) => {
  const rawUrl = req.query.url;
  if (!rawUrl) {
    res.status(400).send("Missing url param");
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    res.status(400).send("Invalid url");
    return;
  }

  if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
    res.status(400).send("Protocol not allowed");
    return;
  }

  try {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      Referer: parsedUrl.origin + "/",
      Origin: parsedUrl.origin,
      Accept: "*/*",
    };
    if (req.headers.range) headers["Range"] = req.headers.range;

    const upstream = await fetch(rawUrl, {
      headers,
      signal: AbortSignal.timeout(30_000),
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Range");
    res.setHeader("Access-Control-Expose-Headers", "Content-Length,Content-Range");

    const ct = upstream.headers.get("content-type");
    if (ct) res.setHeader("Content-Type", ct);
    const cl = upstream.headers.get("content-length");
    if (cl) res.setHeader("Content-Length", cl);
    const cr = upstream.headers.get("content-range");
    if (cr) res.setHeader("Content-Range", cr);

    res.status(upstream.status);
    const body = await upstream.arrayBuffer();
    res.send(Buffer.from(body));
  } catch (err) {
    console.error("Proxy error:", err);
    if (!res.headersSent) res.status(502).send("Proxy error");
  }
});

app.options("/api/proxy", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Range");
  res.status(204).end();
});

// ── Auth stubs (required by frontend) ──
app.get("/api/auth/me", (_req, res) => res.json({ user: null }));
app.post("/api/auth/login", (_req, res) => res.status(501).json({ error: "Not implemented" }));
app.post("/api/auth/register", (_req, res) => res.status(501).json({ error: "Not implemented" }));
app.post("/api/auth/logout", (_req, res) => res.json({ success: true }));

// ── Ratings stubs ──
app.get("/api/ratings", (_req, res) => res.json([]));
app.get("/api/ratings/:mediaType/:titleId", (_req, res) => res.json({ rating: null }));
app.post("/api/ratings", (_req, res) => res.status(501).json({ error: "Not implemented" }));
app.delete("/api/ratings/:mediaType/:titleId", (_req, res) => res.json({ success: true }));

// ── Watchlist stubs ──
app.get("/api/watchlist", (_req, res) => res.json([]));
app.get("/api/watchlist/:mediaType/:titleId", (_req, res) => res.json({ inWatchlist: false }));
app.post("/api/watchlist", (_req, res) => res.status(501).json({ error: "Not implemented" }));
app.delete("/api/watchlist/:mediaType/:titleId", (_req, res) => res.json({ success: true }));

// ── Error handler ──
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err?.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err?.message,
  });
});

export default app;
