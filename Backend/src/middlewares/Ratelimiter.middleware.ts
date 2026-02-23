// ================================================================
// 📌 src/middlewares/rateLimiter.middleware.ts
// ✅ In-memory rate limiter (no Redis needed)
// ✅ Per-user (by JWT user_id) — not by IP
// ✅ Auto-cleanup to prevent memory leaks
// ================================================================

import { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// ─── In-memory store ─────────────────────────────────────
const store = new Map<string, RateLimitEntry>();

// ─── Cleanup every 5 minutes ─────────────────────────────
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  },
  5 * 60 * 1000,
);

// ─── Factory ─────────────────────────────────────────────

interface RateLimitOptions {
  /** Max requests in the window */
  max: number;
  /** Window in seconds */
  windowSeconds: number;
  /** Key prefix to separate different limiters */
  prefix?: string;
  /** Custom message */
  message?: string;
}

/**
 * Rate limiter middleware factory.
 * Tracks requests per authenticated user (falls back to IP).
 *
 * Usage:
 *   rateLimit({ max: 5, windowSeconds: 60 })           // 5 req/min
 *   rateLimit({ max: 3, windowSeconds: 3600, prefix: "admin-create" }) // 3 req/hour
 */
export function rateLimit(options: RateLimitOptions) {
  const { max, windowSeconds, prefix = "rl", message } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Identify user: JWT user_id > IP
    const userId = (req as any).user?.user_id;
    const identifier = userId || req.ip || "unknown";
    const key = `${prefix}:${identifier}`;

    const now = Date.now();
    const entry = store.get(key);

    // First request or window expired
    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      return next();
    }

    // Within window
    entry.count++;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", 0);

      return res.status(429).json({
        message: message || "Too many requests. Please try again later.",
        retry_after_seconds: retryAfter,
      });
    }

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", max - entry.count);
    next();
  };
}

// ─── Pre-configured limiters ─────────────────────────────

/** Sensitive operations: 5 req/min */
export const sensitiveLimit = rateLimit({
  max: 5,
  windowSeconds: 60,
  prefix: "sensitive",
  message: "Too many sensitive operations. Wait 1 minute.",
});

/** Admin creation: 3 req/hour */
export const adminCreateLimit = rateLimit({
  max: 3,
  windowSeconds: 3600,
  prefix: "admin-create",
  message: "Admin creation limit reached. Max 3 per hour.",
});

/** Destructive operations: 10 req/min */
export const destructiveLimit = rateLimit({
  max: 10,
  windowSeconds: 60,
  prefix: "destructive",
  message: "Too many delete operations. Wait 1 minute.",
});

/** Notification broadcast: 5 req/10min */
export const broadcastLimit = rateLimit({
  max: 5,
  windowSeconds: 600,
  prefix: "broadcast",
  message: "Broadcast limit reached. Max 5 per 10 minutes.",
});

/** File upload: 10 req/min */
export const uploadLimit = rateLimit({
  max: 10,
  windowSeconds: 60,
  prefix: "upload",
  message: "Too many uploads. Wait 1 minute.",
});
