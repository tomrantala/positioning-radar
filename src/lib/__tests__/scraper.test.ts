import { describe, it, expect, vi, beforeEach } from "vitest";
import { scrapePage, scrapePages } from "@/lib/scraper";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("scrapePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("FIRECRAWL_API_KEY", "test-api-key");
  });

  it("throws when FIRECRAWL_API_KEY is not set", async () => {
    vi.stubEnv("FIRECRAWL_API_KEY", "");
    await expect(scrapePage("https://example.com")).rejects.toThrow(
      "FIRECRAWL_API_KEY is not set"
    );
  });

  it("normalizes URL by adding https:// if missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          markdown: "content",
          metadata: { title: "Test", description: "desc" },
        },
      }),
    });

    await scrapePage("example.com");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining("https://example.com"),
      })
    );
  });

  it("does not double-add https:// if already present", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          markdown: "content",
          metadata: { title: "Test", description: "desc" },
        },
      }),
    });

    await scrapePage("https://example.com");

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.url).toBe("https://example.com");
  });

  it("preserves http:// URLs", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          markdown: "content",
          metadata: { title: "Test", description: "desc" },
        },
      }),
    });

    await scrapePage("http://example.com");

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.url).toBe("http://example.com");
  });

  it("trims whitespace from URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          markdown: "content",
          metadata: { title: "Test", description: "desc" },
        },
      }),
    });

    await scrapePage("  https://example.com  ");

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.url).toBe("https://example.com");
  });

  it("returns scraped page with correct structure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          markdown: "# Hello World",
          metadata: { title: "My Page", description: "A great page" },
        },
      }),
    });

    const result = await scrapePage("https://example.com");

    expect(result).toEqual({
      url: "https://example.com",
      title: "My Page",
      content: "# Hello World",
      meta_description: "A great page",
    });
  });

  it("handles missing metadata gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          markdown: "content",
          metadata: {},
        },
      }),
    });

    const result = await scrapePage("https://example.com");

    expect(result.title).toBe("");
    expect(result.meta_description).toBe("");
  });

  it("handles null data gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: null }),
    });

    const result = await scrapePage("https://example.com");

    expect(result.title).toBe("");
    expect(result.content).toBe("");
    expect(result.meta_description).toBe("");
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "Rate limited",
    });

    await expect(scrapePage("https://example.com")).rejects.toThrow(
      "Failed to scrape https://example.com: Rate limited"
    );
  });

  it("sends correct headers and body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { markdown: "", metadata: {} } }),
    });

    await scrapePage("https://example.com");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.firecrawl.dev/v1/scrape",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-api-key",
        },
      })
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      url: "https://example.com",
      formats: ["markdown"],
      onlyMainContent: true,
      waitFor: 3000,
    });
  });
});

describe("scrapePages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("FIRECRAWL_API_KEY", "test-api-key");
  });

  it("scrapes all URLs and returns results", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { markdown: "Page 1", metadata: { title: "P1" } },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { markdown: "Page 2", metadata: { title: "P2" } },
        }),
      });

    const results = await scrapePages([
      "https://one.com",
      "https://two.com",
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].content).toBe("Page 1");
    expect(results[1].content).toBe("Page 2");
  });

  it("calls progress callback for each URL", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { markdown: "", metadata: {} } }),
    });

    const onProgress = vi.fn();
    await scrapePages(["https://a.com", "https://b.com", "https://c.com"], onProgress);

    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenCalledWith(1, 3);
    expect(onProgress).toHaveBeenCalledWith(2, 3);
    expect(onProgress).toHaveBeenCalledWith(3, 3);
  });

  it("handles individual scrape failures without stopping", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { markdown: "Good", metadata: { title: "OK" } },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: async () => "Server error",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { markdown: "Also good", metadata: { title: "OK2" } },
        }),
      });

    const results = await scrapePages([
      "https://good.com",
      "https://bad.com",
      "https://alsogood.com",
    ]);

    expect(results).toHaveLength(3);
    expect(results[0].content).toBe("Good");
    expect(results[1].content).toContain("[Failed to scrape this URL:");
    expect(results[2].content).toBe("Also good");
  });

  it("returns empty array for empty input", async () => {
    const results = await scrapePages([]);
    expect(results).toEqual([]);
  });
});
