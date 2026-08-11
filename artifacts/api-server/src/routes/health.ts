import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  let dbStatus: "ok" | "error" = "ok";
  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    dbStatus = "error";
  }

  const data = HealthCheckResponse.parse({
    status: dbStatus === "ok" ? "ok" : "degraded",
    database: dbStatus,
  });

  const statusCode = dbStatus === "ok" ? 200 : 503;
  res.status(statusCode).json(data);
});

export default router;
