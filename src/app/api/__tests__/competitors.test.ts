import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockFindCompetitors } = vi.hoisted(() => ({
  mockFindCompetitors: vi.fn(),
}));
vi.mock("@/lib/competitor-finder", () => ({
  findCompetitors: mockFindCompetitors,
}));

vi.mock("@/lib/rate-limit", () => ({
  competitorLimiter: { check: () => ({ allowed: true, remaining: 99, retryAfterMs: 0 }) },
  applyRateLimit: () => null,
}));

import { POST } from "@/app/api/competitors/route";
import { NextRequest } from "next/server";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/competitors", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/competitors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockResult = {
    company_name: "Example Co",
    detected_industry: "Web development",
    competitors: [
      { name: "Comp A", url: "https://comp-a.com", description: "Agency" },
    ],
  };

  it("returns competitor suggestions for valid URL", async () => {
    mockFindCompetitors.mockResolvedValueOnce(mockResult);

    const res = await POST(makeRequest({ url: "https://example.com" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.company_name).toBe("Example Co");
    expect(data.competitors).toHaveLength(1);
  });

  it("returns 400 for missing URL", async () => {
    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid input");
  });

  it("returns 400 for invalid URL", async () => {
    const res = await POST(makeRequest({ url: "not-a-url" }));

    expect(res.status).toBe(400);
  });

  it("passes locale to findCompetitors", async () => {
    mockFindCompetitors.mockResolvedValueOnce(mockResult);

    await POST(makeRequest({ url: "https://example.com", locale: "fi" }));

    expect(mockFindCompetitors).toHaveBeenCalledWith("https://example.com", "fi");
  });

  it("defaults locale to en", async () => {
    mockFindCompetitors.mockResolvedValueOnce(mockResult);

    await POST(makeRequest({ url: "https://example.com" }));

    expect(mockFindCompetitors).toHaveBeenCalledWith("https://example.com", "en");
  });

  it("returns 500 when findCompetitors throws", async () => {
    mockFindCompetitors.mockRejectedValueOnce(new Error("Search failed"));

    const res = await POST(makeRequest({ url: "https://example.com" }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to find competitors");
    expect(data.message).toBe("Search failed");
  });
});
