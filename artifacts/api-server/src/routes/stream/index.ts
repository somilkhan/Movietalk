import { Readable } from "stream";
import { Router, type IRouter } from "express";
import { streamLimiter } from "../../middlewares/security";

const router: IRouter = Router();

const CINEPRO_URL = process.env.CINEPRO_URL ?? "http://localhost:3001";

const ALLOWED_PROTOCOLS = ["http:", "https:"];

const ALLOWED_PROXY_DOMAINS = process.env.ALLOWED_PROXY_DOMAINS
  ? process.env.ALLOWED_PROXY_DOMAINS.split(",").map((d) => d.trim().toLowerCase())
  : null;

async function proxyToCinePro(path: string): Promise<Response> {
  const url = `${CINEPRO_URL}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(55_000),
  });
  return res;
}

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

    if (req.headers.range) headers["Range"] = req.headers.range;

    const upstream = await fetch(rawUrl, {
      headers,
      signal: AbortSignal.timeout(30_000),
      // @ts-expect-error – Node 18+ fetch option to disable compression
      compress: false,
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

    if (!upstream.body) {
      res.end();
      return;
    }

    Readable.fromWeb(upstream.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
  } catch (err) {
    req.log.error({ err }, "HLS proxy error");
    if (!res.headersSent) res.status(502).send("Proxy error");
  }
});

router.options("/proxy", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Range");
  res.status(204).end();
});

export default router;
