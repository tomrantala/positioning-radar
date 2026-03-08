import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsert = vi.fn();
vi.mock("@/lib/supabase", () => ({
  createServerClient: () => ({
    from: () => ({ insert: mockInsert }),
  }),
}));

vi.mock("@/lib/rate-limit", () => ({
  subscribeLimiter: { check: () => ({ allowed: true, remaining: 99, retryAfterMs: 0 }) },
  applyRateLimit: () => null,
}));

import { POST } from "@/app/api/subscribe/route";
import { NextRequest } from "next/server";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/subscribe", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("returns success for valid input", async () => {
    const res = await POST(makeRequest({
      email: "test@example.com",
      analysis_id: "abc123",
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("saves lead to Supabase with correct fields", async () => {
    await POST(makeRequest({
      email: "test@example.com",
      analysis_id: "abc123",
      source: "premium",
    }));

    expect(mockInsert).toHaveBeenCalledWith({
      email: "test@example.com",
      analysis_id: "abc123",
      source: "premium",
    });
  });

  it("defaults source to full_report", async () => {
    await POST(makeRequest({
      email: "test@example.com",
      analysis_id: "abc123",
    }));

    expect(mockInsert).toHaveBeenCalledWith({
      email: "test@example.com",
      analysis_id: "abc123",
      source: "full_report",
    });
  });

  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({ analysis_id: "abc123" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid input");
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(makeRequest({
      email: "not-an-email",
      analysis_id: "abc123",
    }));

    expect(res.status).toBe(400);
  });

  it("returns 400 for missing analysis_id", async () => {
    const res = await POST(makeRequest({ email: "test@example.com" }));

    expect(res.status).toBe(400);
  });

  it("returns 500 when Supabase insert fails", async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: "DB error" } });

    const res = await POST(makeRequest({
      email: "test@example.com",
      analysis_id: "abc123",
    }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to subscribe");
  });
});
