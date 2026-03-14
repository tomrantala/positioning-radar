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

  // Web search response — Claude returns competitors after searching the web
  const webSearchResult = {
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

  // Fallback flow data (used when web search fails)
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

  function setupWebSearchMocks(result = webSearchResult) {
    // Claude call with web_search tool — response includes search results + text
    mockCreate.mockResolvedValueOnce({
      content: [
        { type: "server_tool_use", id: "srvtoolu_1", name: "web_search", input: { query: "User Co competitors Finland" } },
        { type: "web_search_tool_result", tool_use_id: "srvtoolu_1", content: [
          { type: "web_search_result", url: "https://example.com/article", title: "Top WordPress agencies Finland", encrypted_content: "..." }
        ]},
        { type: "text", text: JSON.stringify(result) },
      ],
    });
  }

  function setupFallbackMocks() {
    // Web search call fails
    mockCreate.mockRejectedValueOnce(new Error("Web search failed"));

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

  describe("Web search path", () => {
    it("passes web_search tool to Claude API call", async () => {
      setupWebSearchMocks();

      await findCompetitors("https://user.com");

      const call = mockCreate.mock.calls[0][0];
      expect(call.tools).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "web_search_20250305",
            name: "web_search",
          }),
        ])
      );
    });

    it("sets max_uses on web_search tool", async () => {
      setupWebSearchMocks();

      await findCompetitors("https://user.com");

      const call = mockCreate.mock.calls[0][0];
      const webSearchTool = call.tools.find((t: { name: string }) => t.name === "web_search");
      expect(webSearchTool.max_uses).toBe(3);
    });

    it("returns detected industry and company name", async () => {
      setupWebSearchMocks();

      const result = await findCompetitors("https://user.com");

      expect(result.detected_industry).toBe("WordPress development");
      expect(result.company_name).toBe("User Co");
    });

    it("returns competitor suggestions", async () => {
      setupWebSearchMocks();

      const result = await findCompetitors("https://user.com");

      expect(result.competitors).toHaveLength(2);
      expect(result.competitors[0]).toEqual({
        name: "Competitor A",
        url: "https://comp-a.com",
        description: "WordPress agency",
      });
    });

    it("uses only one Claude call (no Tavily)", async () => {
      setupWebSearchMocks();

      await findCompetitors("https://user.com");

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockSearch).not.toHaveBeenCalled();
    });

    it("starts scrape in parallel for cache warming", async () => {
      setupWebSearchMocks();

      await findCompetitors("https://user.com");

      expect(mockScrapePage).toHaveBeenCalledWith("https://user.com");
    });

    it("limits competitors to 5", async () => {
      const manyCompetitors = {
        ...webSearchResult,
        competitors: Array.from({ length: 8 }, (_, i) => ({
          name: `Competitor ${i}`,
          url: `https://comp-${i}.com`,
          description: `Desc ${i}`,
        })),
      };
      setupWebSearchMocks(manyCompetitors);

      const result = await findCompetitors("https://user.com");

      expect(result.competitors.length).toBeLessThanOrEqual(5);
    });

    it("extracts JSON from response with mixed content blocks", async () => {
      setupWebSearchMocks();

      const result = await findCompetitors("https://user.com");
      expect(result.company_name).toBe("User Co");
    });

    it("handles JSON in code blocks from Claude", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text:
              "```json\n" + JSON.stringify(webSearchResult) + "\n```",
          },
        ],
      });

      const result = await findCompetitors("https://user.com");
      expect(result.company_name).toBe("User Co");
    });

    it("passes market to Claude prompt", async () => {
      setupWebSearchMocks();

      await findCompetitors("https://user.com", "en", "US");

      const call = mockCreate.mock.calls[0][0];
      expect(call.messages[0].content).toContain("US");
    });

    it("sets user_location for Finland market", async () => {
      setupWebSearchMocks();

      await findCompetitors("https://user.com", "en", "finland");

      const call = mockCreate.mock.calls[0][0];
      const webSearchTool = call.tools.find((t: { name: string }) => t.name === "web_search");
      expect(webSearchTool.user_location).toEqual(
        expect.objectContaining({ country: "FI" })
      );
    });

    it("passes locale for response language", async () => {
      setupWebSearchMocks();

      await findCompetitors("https://user.com", "fi");

      const call = mockCreate.mock.calls[0][0];
      expect(call.messages[0].content).toContain("Finnish");
    });
  });

  describe("Fallback path (web search fails)", () => {
    it("falls back to scrape+Tavily when web search fails", async () => {
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
      // Failed web search + identify + filter = 3 calls total
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });

    it("scrapes page for fallback", async () => {
      setupFallbackMocks();

      await findCompetitors("https://user.com");

      expect(mockScrapePage).toHaveBeenCalledWith("https://user.com");
    });
  });

  describe("Error handling", () => {
    it("falls back to Tavily when Claude returns no text", async () => {
      // Web search returns empty content → error → fallback
      mockCreate.mockResolvedValueOnce({
        content: [],
      });

      // Fallback: identify from scraped content
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: JSON.stringify(identifyResult) }],
      });

      // Tavily search
      mockSearch.mockResolvedValueOnce({
        results: [
          { title: "Comp A", url: "https://comp-a.com", content: "WordPress" },
        ],
      });

      // Filter competitors
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: JSON.stringify(filterResult) }],
      });

      const result = await findCompetitors("https://user.com");
      expect(result.company_name).toBe("User Co");
    });

    it("succeeds even if background scrape fails", async () => {
      setupWebSearchMocks();
      mockScrapePage.mockRejectedValueOnce(new Error("Scrape failed"));

      const result = await findCompetitors("https://user.com");

      expect(result.company_name).toBe("User Co");
      expect(result.competitors).toHaveLength(2);
    });
  });
});
