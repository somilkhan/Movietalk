import { Router, type IRouter } from "express";
import { db, watchlistTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function parseSessionId(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}
function parseTitleId(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}
function parseMediaType(v: unknown): "movie" | "tv" | null {
  return v === "movie" || v === "tv" ? v : null;
}

// GET /api/watchlist?sessionId=xxx
router.get("/watchlist", async (req, res): Promise<void> => {
  const sessionId = parseSessionId(req.query.sessionId);
  if (!sessionId) { res.status(400).json({ error: "sessionId required" }); return; }

  const rows = await db
    .select()
    .from(watchlistTable)
    .where(eq(watchlistTable.sessionId, sessionId))
    .orderBy(watchlistTable.addedAt);

  res.json(rows.map((r) => ({
    titleId: r.titleId,
    mediaType: r.mediaType,
    titleSnapshot: r.titleSnapshot,
    addedAt: r.addedAt,
  })));
});

// GET /api/watchlist/:mediaType/:titleId?sessionId=xxx
router.get("/watchlist/:mediaType/:titleId", async (req, res): Promise<void> => {
  const sessionId = parseSessionId(req.query.sessionId);
  const titleId = parseTitleId(req.params.titleId);
  const mediaType = parseMediaType(req.params.mediaType);
  if (!sessionId || !titleId || !mediaType) { res.status(400).json({ error: "Invalid params" }); return; }

  const [row] = await db
    .select()
    .from(watchlistTable)
    .where(and(
      eq(watchlistTable.sessionId, sessionId),
      eq(watchlistTable.titleId, titleId),
      eq(watchlistTable.mediaType, mediaType),
    ));

  res.json({ inWatchlist: !!row });
});

// POST /api/watchlist  { sessionId, titleId, mediaType, titleSnapshot }
router.post("/watchlist", async (req, res): Promise<void> => {
  const { sessionId: rawSession, titleId: rawId, mediaType: rawMedia, titleSnapshot } = req.body ?? {};
  const sessionId = parseSessionId(rawSession);
  const titleId = parseTitleId(rawId);
  const mediaType = parseMediaType(rawMedia);

  if (!sessionId || !titleId || !mediaType || typeof titleSnapshot !== "object") {
    res.status(400).json({ error: "Invalid body" }); return;
  }

  await db
    .insert(watchlistTable)
    .values({ sessionId, titleId, mediaType, titleSnapshot })
    .onConflictDoNothing();

  res.json({ ok: true });
});

// DELETE /api/watchlist/:mediaType/:titleId?sessionId=xxx
router.delete("/watchlist/:mediaType/:titleId", async (req, res): Promise<void> => {
  const sessionId = parseSessionId(req.query.sessionId);
  const titleId = parseTitleId(req.params.titleId);
  const mediaType = parseMediaType(req.params.mediaType);
  if (!sessionId || !titleId || !mediaType) { res.status(400).json({ error: "Invalid params" }); return; }

  await db
    .delete(watchlistTable)
    .where(and(
      eq(watchlistTable.sessionId, sessionId),
      eq(watchlistTable.titleId, titleId),
      eq(watchlistTable.mediaType, mediaType),
    ));

  res.json({ ok: true });
});

export default router;
