import { describe, it, expect } from "vitest";
import { buildPositioningPrompt } from "@/prompts/positioning-analysis";

describe("buildPositioningPrompt", () => {
  const baseCompanies = [
    { url: "https://example.com", content: "We do software development" },
    { url: "https://competitor.com", content: "We build apps" },
  ];
  const userUrl = "https://example.com";

  it("returns a string containing all company URLs", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("https://example.com");
    expect(result).toContain("https://competitor.com");
  });

  it("includes user URL reference", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain(`The user's own company is: ${userUrl}`);
  });

  it("defaults to English when no locale specified", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("Respond in English");
  });

  it("uses Finnish when locale is fi", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl, undefined, "fi");
    expect(result).toContain("Respond in Finnish");
  });

  it("includes industry when provided", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl, "SaaS");
    expect(result).toContain("Industry: SaaS");
  });

  it("asks to detect industry when not provided", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("Detect the industry automatically");
  });

  it("truncates company content to 5000 characters", () => {
    const longContent = "A".repeat(6000);
    const companies = [{ url: "https://long.com", content: longContent }];
    const result = buildPositioningPrompt(companies, userUrl);
    expect(result).not.toContain("A".repeat(6000));
    expect(result).toContain("A".repeat(5000));
  });

  it("numbers companies sequentially", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("### Company 1: https://example.com");
    expect(result).toContain("### Company 2: https://competitor.com");
  });

  it("includes JSON response structure with v1 fields", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain('"industry_context"');
    expect(result).toContain('"axes"');
    expect(result).toContain('"companies"');
    expect(result).toContain('"insights"');
  });

  // v2: 5 Second Test
  it("includes 5 Second Test analysis section", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("Analysis 2: 5 Second Test");
    expect(result).toContain('"five_second_test"');
    expect(result).toContain('"what_visitor_understands"');
    expect(result).toContain('"what_is_unclear"');
  });

  // v2: Positioning Health Score (6 elements)
  it("includes Positioning Health Score analysis section", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("Analysis 3: Positioning Health Score");
    expect(result).toContain("6 positioning elements");
    expect(result).toContain("best_customers");
    expect(result).toContain("competitive_alternatives");
    expect(result).toContain("unique_attributes");
    expect(result).toContain("value_creators");
    expect(result).toContain("category");
    expect(result).toContain("unique_value_propositions");
  });

  it("instructs to calculate total_score as arithmetic mean", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("arithmetic mean");
  });

  // v2: Red Flags
  it("includes Red Flags analysis section", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("Analysis 4: Red Flags");
    expect(result).toContain("generic_terminology");
    expect(result).toContain("self_focused_language");
    expect(result).toContain("missing_pain_points");
    expect(result).toContain("buzzword_overload");
    expect(result).toContain("interchangeable_messaging");
  });

  it("instructs to only flag problems that actually apply", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("ONLY the problems that actually apply");
  });

  // v2: Recommendations
  it("includes recommendations section in JSON schema", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain('"recommendations"');
    expect(result).toContain("actionable");
  });

  // Tone
  it("instructs neutral tone for analyses and actionable for recommendations", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("neutral and objective");
    expect(result).toContain("actionable and specific");
  });
});
