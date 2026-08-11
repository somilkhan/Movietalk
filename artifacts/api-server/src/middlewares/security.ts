import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { logger } from "../lib/logger";

/**
 * Request ID middleware — attaches a unique ID to each request for tracing.
 */
export function requestId(req: Request, _res: Response, next: NextFunction) {
  req.id = randomUUID();
  next();
}

/**
 * CORS configuration — restricts origins based on environment.
 * In production, only allows the deployed frontend origin.
 * In development, allows localhost origins.
 */
const allowedOrigins = (() => {
  const env = process.env.NODE_ENV ?? "development";
  if (env === "production") {
    const prodOrigin = process.env.FRONTEND_ORIGIN;
    return prodOrigin ? [prodOrigin] : [];
  }
  return [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ];
})();

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, same-origin)
    if (!origin) {
      callback(null, true);
      return;
    }
    // If no FRONTEND_ORIGIN is set in production, allow all origins with a warning
    // This prevents the site from being completely broken on first deploy
    if (allowedOrigins.length === 0) {
      logger.warn(
        { origin },
        "CORS: No FRONTEND_ORIGIN set - allowing all origins. Set FRONTEND_ORIGIN env var for security."
      );
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn({ origin }, "CORS blocked request from disallowed origin");
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
});

/**
 * Helmet configuration — security headers.
 * CSP is relaxed for the streaming app (allows inline styles/scripts from Vite).
 */
export const helmetMiddleware = helmet({
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
  crossOriginEmbedderPolicy: false, // Required for streaming proxies
});

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many requests, please try again later." });
  },
});

/**
 * Strict rate limiter for auth endpoints — 10 requests per 15 minutes per IP.
 * Prevents brute-force attacks on login/register.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many auth attempts, please try again later." });
  },
});

/**
 * Streaming proxy rate limiter — 50 requests per 15 minutes per IP.
 * Prevents abuse of the HLS proxy endpoint.
 */
export const streamLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many stream requests, please slow down." });
  },
});
