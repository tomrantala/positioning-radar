import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockScrapePages, mockAnalyzePositioning, mockInsert } = vi.hoisted(() => ({
  mockScrapePages: vi.fn(),
  mockAnalyzePositioning: vi.fn(),
  mockInsert: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@/lib/scraper", () => ({
  scrapePages: mockScrapePages,
}));

vi.mock("@/lib/analyzer", () => ({
  analyzePositioning: mockAnalyzePositioning,
}));

vi.mock("@/lib/supabase", () => ({
  createServerClient: () => ({
    from: () => ({ insert: mockInsert }),
  }),
}));

import { POST } from "@/app/api/analyze/route";
import { NextRequest } from "next/server";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/analyze", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    user_url: "https://example.com",
    competitor_urls: [
      "https://comp-a.com",
      "https://comp-b.com",
    ],
  };

  const mockPages = [
    { url: "https://example.com", title: "Example", content: "content", meta_description: "" },
    { url: "https://comp-a.com", title: "Comp A", content: "content", meta_description: "" },
    { url: "https://comp-b.com", title: "Comp B", content: "content", meta_description: "" },
  ];

  const mockResult = {
    id: "test-id",
    created_at: "2026-01-01T00:00:00.000Z",
    industry_context: "Web development",
    axes: {
      x: { label: "X", low_label: "Low", high_label: "High" },
      y: { label: "Y", low_label: "Low", high_label: "High" },
    },
    companies: [],
    insights: ["insight 1"],
    recommendations: ["Improve your positioning"],
    user_company_url: "https://example.com",
  };

  it("returns analysis result for valid input", async () => {
    mockScrapePages.mockResolvedValueOnce(mockPages);
    mockAnalyzePositioning.mockResolvedValueOnce(mockResult);

    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe("test-id");
    expect(data.industry_context).toBe("Web development");
  });

  it("returns 400 for missing user_url", async () => {
    const res = await POST(makeRequest({ competitor_urls: ["https://a.com", "https://b.com"] }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid input");
  });

  it("returns 400 for too few competitors", async () => {
    const res = await POST(makeRequest({
      user_url: "https://example.com",
      competitor_urls: ["https://a.com"],
    }));

    expect(res.status).toBe(400);
  });

  it("returns 400 for too many competitors", async () => {
    const res = await POST(makeRequest({
      user_url: "https://example.com",
      competitor_urls: [
        "https://a.com", "https://b.com", "https://c.com",
        "https://d.com", "https://e.com", "https://f.com",
      ],
    }));

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid URLs", async () => {
    const res = await POST(makeRequest({
      user_url: "not-a-url",
      competitor_urls: ["https://a.com", "https://b.com"],
    }));

    expect(res.status).toBe(400);
  });

  it("passes industry and locale to analyzer", async () => {
    mockScrapePages.mockResolvedValueOnce(mockPages);
    mockAnalyzePositioning.mockResolvedValueOnce(mockResult);

    await POST(makeRequest({
      ...validBody,
      industry: "SaaS",
      locale: "fi",
    }));

    expect(mockAnalyzePositioning).toHaveBeenCalledWith(
      mockPages,
      "https://example.com",
      "SaaS",
      "fi"
    );
  });

  it("saves result to Supabase", async () => {
    mockScrapePages.mockResolvedValueOnce(mockPages);
    mockAnalyzePositioning.mockResolvedValueOnce(mockResult);

    await POST(makeRequest(validBody));

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "test-id",
        user_url: "https://example.com",
        competitor_urls: validBody.competitor_urls,
      })
    );
  });

  it("includes recommendations in Supabase result JSONB", async () => {
    mockScrapePages.mockResolvedValueOnce(mockPages);
    mockAnalyzePositioning.mockResolvedValueOnce(mockResult);

    await POST(makeRequest(validBody));

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        result: expect.objectContaining({
          recommendations: ["Improve your positioning"],
        }),
      })
    );
  });

  it("still returns result when Supabase save fails", async () => {
    mockScrapePages.mockResolvedValueOnce(mockPages);
    mockAnalyzePositioning.mockResolvedValueOnce(mockResult);
    mockInsert.mockResolvedValueOnce({ error: { message: "DB error" } });

    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe("test-id");
  });

  it("returns 500 when scraper throws", async () => {
    mockScrapePages.mockRejectedValueOnce(new Error("Scrape failed"));

    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Analysis failed");
    expect(data.message).toBe("Scrape failed");
  });
});
