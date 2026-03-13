import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock scraper
const { mockScrapePage } = vi.hoisted(() => ({
  mockScrapePage: vi.fn().mockResolvedValue({
    url: "https://user.com",
    title: "User Co",
    content: "We build websites with WordPress",
    meta_description: "WordPress agency",
  }),
}));
vi.mock("@/lib/scraper", () => ({
  scrapePage: mockScrapePage,
}));

// Mock Anthropic
const { mockCreate, mockSearch } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockSearch: vi.fn(),
}));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

// Mock Tavily
vi.mock("@tavily/core", () => ({
  tavily: vi.fn(() => ({ search: mockSearch })),
}));

import { findCompetitors } from "@/lib/competitor-finder";
import { competitorCache } from "@/lib/cache";

describe("findCompetitors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    competitorCache.clear();
    vi.stubEnv("TAVILY_API_KEY", "test-tavily-key");
    vi.stubEnv("POSITIONING_RADAR_ANTHROPIC_KEY", "test-anthropic-key");
  });

  // Claude-first response (high confidence)
  const claudeFirstResult = {
    confidence: "high",
    company_name: "User Co",
    industry: "WordPress development",
    country: "Finland",
    competitors: [
      {
        name: "Competitor A",
        url: "https://comp-a.com",
        description: "WordPress agency",
      },
      {
        name: "Competitor B",
        url: "https://comp-b.com",
        description: "Web agency",
      },
    ],
  };

  // Claude-first response (low confidence — triggers fallback)
  const claudeFirstLowConfidence = {
    confidence: "low",
    company_name: "Unknown Co",
    industry: "Unknown",
    country: "Unknown",
    competitors: [],
  };

  // Legacy flow data (used by fallback)
  const identifyResult = {
    company_name: "User Co",
    industry: "WordPress development",
    search_query: "top WordPress agencies in Finland",
    country: "Finland",
  };

  const filterResult = {
    competitors: [
      {
        name: "Competitor A",
        url: "https://comp-a.com",
        description: "WordPress agency",
      },
      {
        name: "Competitor B",
        url: "https://comp-b.com",
        description: "Web agency",
      },
    ],
  };

  function setupClaudeFirstMocks(result = claudeFirstResult) {
    // Single Claude call for Claude-first path
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(result) }],
    });
  }

  function setupFallbackMocks() {
    // Claude-first returns low confidence
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify(claudeFirstLowConfidence),
        },
      ],
    });

    // Fallback: identify from scraped content
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(identifyResult) }],
    });

    // Tavily search
    mockSearch.mockResolvedValueOnce({
      results: [
        { title: "Comp A", url: "https://comp-a.com", content: "WordPress" },
        { title: "Comp B", url: "https://comp-b.com", content: "Web dev" },
      ],
    });

    // Filter competitors
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(filterResult) }],
    });
  }

  describe("Claude-first path (high confidence)", () => {
    it("returns detected industry and company name", async () => {
      setupClaudeFirstMocks();

      const result = await findCompetitors("https://user.com");

      expect(result.detected_industry).toBe("WordPress development");
      expect(result.company_name).toBe("User Co");
    });

    it("returns competitor suggestions", async () => {
      setupClaudeFirstMocks();

      const result = await findCompetitors("https://user.com");

      expect(result.competitors).toHaveLength(2);
      expect(result.competitors[0]).toEqual({
        name: "Competitor A",
        url: "https://comp-a.com",
        description: "WordPress agency",
      });
    });

    it("uses only one Claude call (no Tavily)", async () => {
      setupClaudeFirstMocks();

      await findCompetitors("https://user.com");

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockSearch).not.toHaveBeenCalled();
    });

    it("starts scrape in parallel for cache warming", async () => {
      setupClaudeFirstMocks();

      await findCompetitors("https://user.com");

      expect(mockScrapePage).toHaveBeenCalledWith("https://user.com");
    });

    it("limits competitors to 5", async () => {
      const manyCompetitors = {
        ...claudeFirstResult,
        competitors: Array.from({ length: 8 }, (_, i) => ({
          name: `Competitor ${i}`,
          url: `https://comp-${i}.com`,
          description: `Desc ${i}`,
        })),
      };
      setupClaudeFirstMocks(manyCompetitors);

      const result = await findCompetitors("https://user.com");

      expect(result.competitors.length).toBeLessThanOrEqual(5);
    });

    it("handles JSON in code blocks from Claude", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text:
              "```json\n" + JSON.stringify(claudeFirstResult) + "\n```",
          },
        ],
      });

      const result = await findCompetitors("https://user.com");
      expect(result.company_name).toBe("User Co");
    });

    it("passes market to Claude prompt", async () => {
      setupClaudeFirstMocks();

      await findCompetitors("https://user.com", "en", "US");

      const call = mockCreate.mock.calls[0];
      expect(call[0].messages[0].content).toContain("US");
    });

    it("passes locale for response language", async () => {
      setupClaudeFirstMocks();

      await findCompetitors("https://user.com", "fi");

      const call = mockCreate.mock.calls[0];
      expect(call[0].messages[0].content).toContain("Finnish");
    });
  });

  describe("Fallback path (low confidence)", () => {
    it("falls back to scrape+Tavily when confidence is low", async () => {
      setupFallbackMocks();

      const result = await findCompetitors("https://user.com");

      expect(result.company_name).toBe("User Co");
      expect(result.detected_industry).toBe("WordPress development");
      expect(result.competitors).toHaveLength(2);
    });

    it("uses Tavily search in fallback", async () => {
      setupFallbackMocks();

      await findCompetitors("https://user.com");

      expect(mockSearch).toHaveBeenCalled();
      // Claude-first + identify + filter = 3 calls
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });

    it("scrapes page in parallel so it is cached for fallback", async () => {
      setupFallbackMocks();

      await findCompetitors("https://user.com");

      // scrapePage is called in parallel with Claude-first, and again in fallback.
      // In production the second call is a cache hit (scrapeCache in scraper.ts).
      // Here we verify the URL is consistent across both calls.
      expect(mockScrapePage).toHaveBeenCalledWith("https://user.com");
    });
  });

  describe("Error handling", () => {
    it("throws when Claude returns no text", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [],
      });

      await expect(findCompetitors("https://user.com")).rejects.toThrow(
        "Failed to identify company"
      );
    });

    it("succeeds even if background scrape fails", async () => {
      setupClaudeFirstMocks();
      mockScrapePage.mockRejectedValueOnce(new Error("Scrape failed"));

      const result = await findCompetitors("https://user.com");

      expect(result.company_name).toBe("User Co");
      expect(result.competitors).toHaveLength(2);
    });
  });
});
