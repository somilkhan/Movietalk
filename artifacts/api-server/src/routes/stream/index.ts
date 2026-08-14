import { Readable } from "stream";
import { Router, type IRouter } from "express";
import { streamLimiter } from "../../middlewares/security";

const router: IRouter = Router();

const CINEPRO_URL = process.env.CINEPRO_URL ?? "http://localhost:3001";

// Allowed protocols for the proxy
const ALLOWED_PROTOCOLS = ["http:", "https:"];

// Optional: restrict proxy to known streaming domains
const ALLOWED_PROXY_DOMAINS = process.env.ALLOWED_PROXY_DOMAINS
  ? process.env.ALLOWED_PROXY_DOMAINS.split(",").map((d) => d.trim().toLowerCase())
  : null; // null = allow all (default for development)

async function proxyToCinePro(path: string): Promise<Response> {
  const url = `${CINEPRO_URL}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(55_000),
  });
  return res;
}

/** GET /api/stream/movie/:id → CinePro /v1/movies/:id */
router.get("/stream/movie/:id", async (req, res): Promise<void> => {
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
    req.log.error({ err }, "CinePro proxy error (movie)");
    res.status(503).json({
      error: "Stream service unavailable",
      sources: [],
      subtitles: [],
      diagnostics: [{ message: "CinePro Core is not running or returned an error" }],
    });
  }
});

/** GET /api/stream/tv/:id/season/:s/episode/:e → CinePro /v1/tv/:id/seasons/:s/episodes/:e */
router.get(
  "/stream/tv/:id/season/:s/episode/:e",
  async (req, res): Promise<void> => {
    const id = Number(req.params.id);
    const s = Number(req.params.s);
    const e = Number(req.params.e);
    if (!Number.isFinite(id) || !Number.isFinite(s) || !Number.isFinite(e)) {
      res.status(400).json({ error: "Invalid params" });
      return;
    }
    try {
      const upstream = await proxyToCinePro(
        `/v1/tv/${id}/seasons/${s}/episodes/${e}`,
      );
      const data = await upstream.json();
      res.status(upstream.status).json(data);
    } catch (err) {
      req.log.error({ err }, "CinePro proxy error (tv)");
      res.status(503).json({
        error: "Stream service unavailable",
        sources: [],
        subtitles: [],
        diagnostics: [{ message: "CinePro Core is not running or returned an error" }],
      });
    }
  },
);

/**
 * POST /api/bingr/stream
 * Compatibility endpoint for the Bingr-style player.
 * Reuses the existing CinePro aggregated stream response and filters it to
 * the requested Bingr server; it does not run a second extraction path.
 */
router.post("/bingr/stream", streamLimiter, async (req, res): Promise<void> => {
  const body = (req.body ?? {}) as {
    srv?: string;
    t?: "movie" | "tv";
    id?: number;
    query?: {
      title?: string;
      year?: string;
      season?: number;
      episode?: number;
    };
  };

  const srv = typeof body.srv === "string" ? body.srv : "";
  const type = body.t === "tv" ? "tv" : "movie";
  const id = Number(body.id);
  const season = Number(body.query?.season);
  const episode = Number(body.query?.episode);

  if (!srv || !Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid Bingr stream request", sources: [], subtitles: [] });
    return;
  }

  try {
    const path = type === "tv" && Number.isFinite(season) && Number.isFinite(episode)
      ? `/v1/tv/${id}/seasons/${season}/episodes/${episode}`
      : `/v1/movies/${id}`;

    const upstream = await proxyToCinePro(path);
    const data = (await upstream.json()) as {
      sources?: Array<{
        url?: string;
        type?: string;
        quality?: string | number;
        provider?: { id?: string; name?: string };
        audioTracks?: Array<{ label: string; language: string }>;
      }>;
      subtitles?: Array<{ url?: string; label?: string; language?: string }>;
      diagnostics?: unknown[];
    };

    if (!upstream.ok) {
      res.status(upstream.status).json(data);
      return;
    }

    const normalizedSrv = srv.toLowerCase();
    const serverNames: Record<string, string> = {
      s11: "sirius",
      s40: "darkmatter",
      s12: "quasar",
      s30: "apollo",
      s1: "miller",
      s2: "mann",
      s3: "edmunds",
      s4: "luna",
      s5: "aditya",
    };
    const serverName = serverNames[normalizedSrv] ?? normalizedSrv;

    const sources = (data.sources ?? []).filter((source) => {
      const provider = `${source.provider?.id ?? ""} ${source.provider?.name ?? ""}`.toLowerCase();
      return provider.includes(normalizedSrv) || provider.includes(serverName);
    });

    res.status(200).json({
      sources,
      subtitles: data.subtitles ?? [],
      diagnostics: data.diagnostics ?? [],
    });
  } catch (err) {
    req.log.error({ err }, "CinePro compatibility proxy error (Bingr)");
    res.status(503).json({
      error: "Stream service unavailable",
      sources: [],
      subtitles: [],
      diagnostics: [{ message: "CinePro Core is not running or returned an error" }],
    });
  }
});

/**
 * GET /api/proxy?url=<encoded>
 *
 * Transparent streaming proxy – tunnels any HLS manifest or segment through
 * the server so the browser never makes a cross-origin request directly.
 * HLS.js fetchSetup rewrites every request URL to go through here.
 */
router.get("/proxy", streamLimiter, async (req, res): Promise<void> => {
  const rawUrl = req.query.url as string | undefined;

  if (!rawUrl) {
    res.status(400).send("Missing url param");
    return;
  }

  let parsedUrl: URL;
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

  // Domain restriction (if configured)
  if (ALLOWED_PROXY_DOMAINS) {
    const hostname = parsedUrl.hostname.toLowerCase();
    const allowed = ALLOWED_PROXY_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
    if (!allowed) {
      req.log.warn({ hostname }, "Proxy domain blocked");
      res.status(403).send("Domain not allowed");
      return;
    }
  }

  try {
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      Referer: parsedUrl.origin + "/",
      Origin: parsedUrl.origin,
      Accept: "*/*",
    };

    // Forward Range so seeking works
    if (req.headers.range) headers["Range"] = req.headers.range;

    const upstream = await fetch(rawUrl, {
      headers,
      signal: AbortSignal.timeout(30_000),
      // @ts-expect-error – Node 18+ fetch option to disable compression
      compress: false,
    });

    // CORS + passthrough headers
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

    if (!upstream.body) {
      res.end();
      return;
    }

    // Stream the body without buffering it all in memory
    Readable.fromWeb(upstream.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
  } catch (err) {
    req.log.error({ err }, "HLS proxy error");
    if (!res.headersSent) res.status(502).send("Proxy error");
  }
});

// Handle CORS preflight for the proxy
router.options("/proxy", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Range");
  res.status(204).end();
});

export default router;
