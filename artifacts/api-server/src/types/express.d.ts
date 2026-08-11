import type { Request as ExpressRequest } from "express";

declare global {
  namespace Express {
    interface Request {
      /** Unique request ID for tracing (set by requestId middleware) */
      id?: string;
    }
  }
}

export {};
