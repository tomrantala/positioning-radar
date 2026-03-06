import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock scraper
vi.mock("@/lib/scraper", () => ({
  scrapePage: vi.fn().mockResolvedValue({
    url: "https://user.com",
    title: "User Co",
    content: "We build websites with WordPress",
    meta_description: "WordPress agency",
  }),
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

describe("findCompetitors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TAVILY_API_KEY", "test-tavily-key");
  });

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

  function setupMocks() {
    // First Claude call: identify company
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

    // Second Claude call: filter competitors
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(filterResult) }],
    });
  }

  it("returns detected industry and company name", async () => {
    setupMocks();

    const result = await findCompetitors("https://user.com");

    expect(result.detected_industry).toBe("WordPress development");
    expect(result.company_name).toBe("User Co");
  });

  it("returns competitor suggestions", async () => {
    setupMocks();

    const result = await findCompetitors("https://user.com");

    expect(result.competitors).toHaveLength(2);
    expect(result.competitors[0]).toEqual({
      name: "Competitor A",
      url: "https://comp-a.com",
      description: "WordPress agency",
    });
  });

  it("limits competitors to 5", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(identifyResult) }],
    });

    mockSearch.mockResolvedValueOnce({
      results: Array.from({ length: 10 }, (_, i) => ({
        title: `Comp ${i}`,
        url: `https://comp-${i}.com`,
        content: "content",
      })),
    });

    const manyCompetitors = {
      competitors: Array.from({ length: 8 }, (_, i) => ({
        name: `Competitor ${i}`,
        url: `https://comp-${i}.com`,
        description: `Desc ${i}`,
      })),
    };

    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(manyCompetitors) }],
    });

    const result = await findCompetitors("https://user.com");

    expect(result.competitors.length).toBeLessThanOrEqual(5);
  });

  it("handles JSON in code blocks from Claude", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: "```json\n" + JSON.stringify(identifyResult) + "\n```",
        },
      ],
    });

    mockSearch.mockResolvedValueOnce({
      results: [
        { title: "Comp", url: "https://comp.com", content: "content" },
      ],
    });

    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: "```json\n" + JSON.stringify(filterResult) + "\n```",
        },
      ],
    });

    const result = await findCompetitors("https://user.com");
    expect(result.company_name).toBe("User Co");
  });

  it("throws when first Claude call returns no text", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [],
    });

    await expect(findCompetitors("https://user.com")).rejects.toThrow(
      "Failed to identify company"
    );
  });

  it("throws when second Claude call returns no text", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(identifyResult) }],
    });

    mockSearch.mockResolvedValueOnce({
      results: [
        { title: "Comp", url: "https://comp.com", content: "content" },
      ],
    });

    mockCreate.mockResolvedValueOnce({
      content: [],
    });

    await expect(findCompetitors("https://user.com")).rejects.toThrow(
      "Failed to filter competitors"
    );
  });

  it("passes locale to filter Claude call", async () => {
    setupMocks();

    await findCompetitors("https://user.com", "fi");

    // The second Claude call should mention Finnish
    const secondCall = mockCreate.mock.calls[1];
    expect(secondCall[0].messages[0].content).toContain("Finnish");
  });
});
