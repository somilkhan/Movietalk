import { Router, type IRouter } from "express";
import { db, ratingsTable } from "@workspace/db";
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
function parseRating(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 10 ? n : null;
}

// GET /api/ratings?sessionId=xxx
router.get("/ratings", async (req, res): Promise<void> => {
  const sessionId = parseSessionId(req.query.sessionId);
  if (!sessionId) { res.status(400).json({ error: "sessionId required" }); return; }

  const rows = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.sessionId, sessionId))
    .orderBy(ratingsTable.ratedAt);

  res.json(rows.map((r) => ({
    titleId: r.titleId,
    mediaType: r.mediaType,
    rating: r.rating,
    titleSnapshot: r.titleSnapshot,
    ratedAt: r.ratedAt,
  })));
});

// GET /api/ratings/:mediaType/:titleId?sessionId=xxx
router.get("/ratings/:mediaType/:titleId", async (req, res): Promise<void> => {
  const sessionId = parseSessionId(req.query.sessionId);
  const titleId = parseTitleId(req.params.titleId);
  const mediaType = parseMediaType(req.params.mediaType);
  if (!sessionId || !titleId || !mediaType) { res.status(400).json({ error: "Invalid params" }); return; }

  const [row] = await db
    .select()
    .from(ratingsTable)
    .where(and(
      eq(ratingsTable.sessionId, sessionId),
      eq(ratingsTable.titleId, titleId),
      eq(ratingsTable.mediaType, mediaType),
    ));

  res.json({ rating: row?.rating ?? null });
});

// POST /api/ratings  { sessionId, titleId, mediaType, rating, titleSnapshot }
router.post("/ratings", async (req, res): Promise<void> => {
  const { sessionId: rawSession, titleId: rawId, mediaType: rawMedia, rating: rawRating, titleSnapshot } = req.body ?? {};
  const sessionId = parseSessionId(rawSession);
  const titleId = parseTitleId(rawId);
  const mediaType = parseMediaType(rawMedia);
  const rating = parseRating(rawRating);

  if (!sessionId || !titleId || !mediaType || !rating || typeof titleSnapshot !== "object") {
    res.status(400).json({ error: "Invalid body" }); return;
  }

  await db
    .insert(ratingsTable)
    .values({ sessionId, titleId, mediaType, rating, titleSnapshot })
    .onConflictDoUpdate({
      target: [ratingsTable.sessionId, ratingsTable.titleId, ratingsTable.mediaType],
      set: { rating, titleSnapshot, ratedAt: new Date() },
    });

  res.json({ ok: true });
});

// DELETE /api/ratings/:mediaType/:titleId?sessionId=xxx
router.delete("/ratings/:mediaType/:titleId", async (req, res): Promise<void> => {
  const sessionId = parseSessionId(req.query.sessionId);
  const titleId = parseTitleId(req.params.titleId);
  const mediaType = parseMediaType(req.params.mediaType);
  if (!sessionId || !titleId || !mediaType) { res.status(400).json({ error: "Invalid params" }); return; }

  await db
    .delete(ratingsTable)
    .where(and(
      eq(ratingsTable.sessionId, sessionId),
      eq(ratingsTable.titleId, titleId),
      eq(ratingsTable.mediaType, mediaType),
    ));

  res.json({ ok: true });
});

export default router;
