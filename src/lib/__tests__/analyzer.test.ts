import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: () => "test-id-12345",
}));

// Mock Anthropic
const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

// Mock prompt builder
vi.mock("@/prompts/positioning-analysis", () => ({
  buildPositioningPrompt: vi.fn().mockReturnValue("mock prompt"),
}));

import { analyzePositioning } from "@/lib/analyzer";
import type { ScrapedPage } from "@/lib/types";

describe("analyzePositioning", () => {
  const mockPages: ScrapedPage[] = [
    {
      url: "https://user.com",
      title: "User Company",
      content: "We build software",
      meta_description: "Software company",
    },
    {
      url: "https://competitor.com",
      title: "Competitor",
      content: "We also build software",
      meta_description: "Another software company",
    },
  ];

  const mockAnalysis = {
    industry_context: "Software industry",
    axes: {
      x: { label: "Price", low_label: "Low", high_label: "High" },
      y: { label: "Scope", low_label: "Narrow", high_label: "Broad" },
    },
    companies: [
      {
        name: "User Co",
        url: "https://user.com",
        x_score: 50,
        y_score: -30,
        key_messages: ["Fast delivery"],
        target_audience: "SMBs",
        differentiation_summary: "Speed-focused",
        differentiation_index: 65,
      },
    ],
    insights: ["Companies cluster in premium segment"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00Z"));
  });

  it("returns a valid PositioningResult", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(mockAnalysis) }],
    });

    const result = await analyzePositioning(mockPages, "https://user.com");

    expect(result).toMatchObject({
      id: "test-id-12345",
      created_at: "2026-01-15T10:00:00.000Z",
      industry_context: "Software industry",
      user_company_url: "https://user.com",
    });
    expect(result.axes.x.label).toBe("Price");
    expect(result.companies).toHaveLength(1);
    expect(result.insights).toHaveLength(1);

    vi.useRealTimers();
  });

  it("extracts JSON from markdown code blocks", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: "```json\n" + JSON.stringify(mockAnalysis) + "\n```",
        },
      ],
    });

    const result = await analyzePositioning(mockPages, "https://user.com");
    expect(result.industry_context).toBe("Software industry");

    vi.useRealTimers();
  });

  it("extracts JSON from code blocks without language tag", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: "```\n" + JSON.stringify(mockAnalysis) + "\n```",
        },
      ],
    });

    const result = await analyzePositioning(mockPages, "https://user.com");
    expect(result.industry_context).toBe("Software industry");

    vi.useRealTimers();
  });

  it("handles raw JSON response (no code blocks)", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(mockAnalysis) }],
    });

    const result = await analyzePositioning(mockPages, "https://user.com");
    expect(result.industry_context).toBe("Software industry");

    vi.useRealTimers();
  });

  it("throws when Claude returns no text block", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "tool_use", id: "123", name: "test", input: {} }],
    });

    await expect(
      analyzePositioning(mockPages, "https://user.com")
    ).rejects.toThrow("No text response from Claude");

    vi.useRealTimers();
  });

  it("throws on invalid JSON response", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "not valid json at all" }],
    });

    await expect(
      analyzePositioning(mockPages, "https://user.com")
    ).rejects.toThrow();

    vi.useRealTimers();
  });

  it("calls Claude with correct model", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(mockAnalysis) }],
    });

    await analyzePositioning(mockPages, "https://user.com");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
      })
    );

    vi.useRealTimers();
  });

  it("formats page content correctly for prompt", async () => {
    const { buildPositioningPrompt } = await import(
      "@/prompts/positioning-analysis"
    );

    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(mockAnalysis) }],
    });

    await analyzePositioning(mockPages, "https://user.com", "Tech", "fi");

    expect(buildPositioningPrompt).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://user.com",
          content: expect.stringContaining("# User Company"),
        }),
      ]),
      "https://user.com",
      "Tech",
      "fi"
    );

    vi.useRealTimers();
  });
});
