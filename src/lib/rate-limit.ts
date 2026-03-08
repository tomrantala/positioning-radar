import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * In-memory sliding-window rate limiter.
 * Suitable for serverless (short-lived) — provides basic abuse protection.
 * For production scale, replace internals with Redis.
 */
export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private lastCleanup = Date.now();

  constructor(config: RateLimiterConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }

  check(key: string): RateLimitResult {
    const now = Date.now();

    // Periodic cleanup of stale entries
    if (now - this.lastCleanup > this.windowMs) {
      this.cleanup(now);
    }

    const entry = this.store.get(key);

    // No entry or window expired → fresh start
    if (!entry || now >= entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, retryAfterMs: 0 };
    }

    // Within window
    if (entry.count < this.maxRequests) {
      entry.count++;
      return {
        allowed: true,
        remaining: this.maxRequests - entry.count,
        retryAfterMs: 0,
      };
    }

    // Over limit
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  private cleanup(now: number) {
    for (const [key, entry] of this.store) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
      }
    }
    this.lastCleanup = now;
  }
}

// --- Pre-configured limiters for API routes ---

/** Analyze endpoint: 5 requests per 10 minutes per IP */
export const analyzeLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 10 * 60 * 1000,
});

/** Competitor discovery: 10 requests per 10 minutes per IP */
export const competitorLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 10 * 60 * 1000,
});

/** Email subscribe: 5 requests per hour per IP */
export const subscribeLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000,
});

/**
 * Extract client IP from Next.js request.
 * Uses x-forwarded-for (Vercel sets this) or falls back to a default.
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Apply rate limiting to a request. Returns a 429 response if over limit,
 * or null if allowed (caller should continue processing).
 */
export function applyRateLimit(
  limiter: RateLimiter,
  request: NextRequest
): NextResponse | null {
  const ip = getClientIp(request);
  const result = limiter.check(ip);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfterSeconds: Math.ceil(result.retryAfterMs / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}
