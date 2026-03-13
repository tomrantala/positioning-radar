interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheOptions {
  ttlMs: number;
  maxEntries: number;
}

export class ResponseCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor(options: CacheOptions) {
    this.ttlMs = options.ttlMs;
    this.maxEntries = options.maxEntries;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    // Evict oldest if at capacity
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) {
        this.store.delete(oldest);
      }
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  clear(): void {
    this.store.clear();
  }

  /**
   * Wraps an async function with caching. Returns a function that
   * checks cache first and only calls the original on cache miss.
   */
  wrap(key: string, fn: () => Promise<T>): () => Promise<T> {
    return async () => {
      const cached = this.get(key);
      if (cached !== undefined) return cached;
      const result = await fn();
      this.set(key, result);
      return result;
    };
  }
}

// Pre-configured caches for different response types
// Scrape cache: 1 hour TTL, 200 entries max
export const scrapeCache = new ResponseCache<unknown>({
  ttlMs: 60 * 60 * 1000,
  maxEntries: 200,
});

// Competitor finder cache: 30 min TTL, 50 entries
export const competitorCache = new ResponseCache<unknown>({
  ttlMs: 30 * 60 * 1000,
  maxEntries: 50,
});
