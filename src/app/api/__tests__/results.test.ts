import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSingle = vi.fn();
const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

vi.mock("@/lib/supabase", () => ({
  createServerClient: () => ({
    from: () => ({ select: mockSelect }),
  }),
}));

import { GET } from "@/app/api/results/[id]/route";
import { NextRequest } from "next/server";

describe("GET /api/results/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
  });

  function callGET(id: string) {
    const request = new NextRequest(`http://localhost/api/results/${id}`);
    return GET(request, { params: Promise.resolve({ id }) });
  }

  it("returns analysis data when found", async () => {
    const dbRow = {
      id: "abc123",
      created_at: "2026-01-01T00:00:00Z",
      user_url: "https://example.com",
      result: {
        industry_context: "Web dev",
        axes: { x: {}, y: {} },
        companies: [],
        insights: [],
      },
    };

    mockSingle.mockResolvedValueOnce({ data: dbRow, error: null });

    const res = await callGET("abc123");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe("abc123");
    expect(data.user_company_url).toBe("https://example.com");
    expect(data.industry_context).toBe("Web dev");
  });

  it("returns 404 when analysis not found", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: "Not found" } });

    const res = await callGET("nonexistent");
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("Analysis not found");
  });

  it("returns 404 when data is null without error", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null });

    const res = await callGET("nonexistent");

    expect(res.status).toBe(404);
  });

  it("queries Supabase with the correct id", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null });

    await callGET("my-test-id");

    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("id", "my-test-id");
  });

  it("spreads result fields into response", async () => {
    const dbRow = {
      id: "xyz",
      created_at: "2026-01-01T00:00:00Z",
      user_url: "https://example.com",
      result: {
        industry_context: "SaaS",
        custom_field: "value",
      },
    };

    mockSingle.mockResolvedValueOnce({ data: dbRow, error: null });

    const res = await callGET("xyz");
    const data = await res.json();

    expect(data.custom_field).toBe("value");
  });
});
