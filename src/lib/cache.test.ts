import { describe, it, expect, beforeEach, vi } from "vitest";
import { ResponseCache } from "./cache";

describe("ResponseCache", () => {
  let cache: ResponseCache<string>;

  beforeEach(() => {
    cache = new ResponseCache<string>({ ttlMs: 60_000, maxEntries: 100 });
  });

  it("stores and retrieves a value by key", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("returns undefined for expired entries", () => {
    vi.useFakeTimers();

    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");

    vi.advanceTimersByTime(60_001);
    expect(cache.get("key1")).toBeUndefined();

    vi.useRealTimers();
  });

  it("evicts oldest entries when max size exceeded", () => {
    const small = new ResponseCache<string>({ ttlMs: 60_000, maxEntries: 3 });

    small.set("a", "1");
    small.set("b", "2");
    small.set("c", "3");
    small.set("d", "4"); // should evict "a"

    expect(small.get("a")).toBeUndefined();
    expect(small.get("b")).toBe("2");
    expect(small.get("d")).toBe("4");
  });

  it("wraps an async function with caching", async () => {
    const expensive = vi.fn().mockResolvedValue("result");
    const cached = cache.wrap("mykey", expensive);

    const r1 = await cached();
    const r2 = await cached();

    expect(r1).toBe("result");
    expect(r2).toBe("result");
    expect(expensive).toHaveBeenCalledTimes(1); // only called once
  });
});
