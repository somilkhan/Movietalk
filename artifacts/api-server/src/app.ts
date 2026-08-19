import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  requestId,
  corsMiddleware,
  helmetMiddleware,
  generalLimiter,
} from "./middlewares/security";

const app: Express = express();

// Vercel/reverse proxies provide the client IP through X-Forwarded-For.
// Trust the immediate proxy so express-rate-limit can derive a stable client key.
app.set("trust proxy", 1);

// Security headers
app.use(helmetMiddleware);

// Request ID for tracing
app.use(requestId);

// Structured logging
app.use(
  pinoHttp({
    logger,
    genReqKey: (req) => req.id as string,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// CORS — restricted to known origins
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing — REQUIRED for session auth
app.use(cookieParser());

// General rate limiting
app.use(generalLimiter);

// API routes
app.use("/api", router);

// Serve static frontend files in production
const staticPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "artifacts",
  "allrated",
  "dist",
  "public",
);
app.use(express.static(staticPath));

// SPA fallback — serve index.html for all non-API routes
app.use((_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// Global error handler — must have 4 args so Express treats it as error middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  logger.error({ err }, "Unhandled error");
  // Never leak stack traces or internal details to the client
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err?.message || "Internal server error";
  res.status(err?.status || 500).json({ error: message });
});

export default app;
