import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimiter } from "./rate-limit";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ maxRequests: 3, windowMs: 60_000 });
  });

  it("allows requests within the limit", () => {
    const r1 = limiter.check("1.2.3.4");
    const r2 = limiter.check("1.2.3.4");
    const r3 = limiter.check("1.2.3.4");

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests over the limit", () => {
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    const r4 = limiter.check("1.2.3.4");

    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks IPs independently", () => {
    limiter.check("1.1.1.1");
    limiter.check("1.1.1.1");
    limiter.check("1.1.1.1");

    const other = limiter.check("2.2.2.2");
    expect(other.allowed).toBe(true);
    expect(other.remaining).toBe(2);
  });

  it("resets after the window expires", () => {
    vi.useFakeTimers();

    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    expect(limiter.check("1.2.3.4").allowed).toBe(false);

    // Advance past window
    vi.advanceTimersByTime(60_001);

    const after = limiter.check("1.2.3.4");
    expect(after.allowed).toBe(true);
    expect(after.remaining).toBe(2);

    vi.useRealTimers();
  });

  it("cleans up stale entries", () => {
    vi.useFakeTimers();

    // Create many IPs
    for (let i = 0; i < 100; i++) {
      limiter.check(`10.0.0.${i}`);
    }

    // Advance past window
    vi.advanceTimersByTime(60_001);

    // One new request triggers cleanup
    limiter.check("new-ip");

    // Stale entries should have been pruned (internal, but we can verify
    // the limiter still works correctly after cleanup)
    const result = limiter.check("new-ip");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);

    vi.useRealTimers();
  });
});
