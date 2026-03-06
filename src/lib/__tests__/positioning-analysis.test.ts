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

  it("truncates company content to 4000 characters", () => {
    const longContent = "A".repeat(5000);
    const companies = [{ url: "https://long.com", content: longContent }];
    const result = buildPositioningPrompt(companies, userUrl);
    // The content should be sliced to 4000 chars
    expect(result).not.toContain("A".repeat(5000));
    expect(result).toContain("A".repeat(4000));
  });

  it("numbers companies sequentially", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("### Company 1: https://example.com");
    expect(result).toContain("### Company 2: https://competitor.com");
  });

  it("includes JSON response structure", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain('"industry_context"');
    expect(result).toContain('"axes"');
    expect(result).toContain('"companies"');
    expect(result).toContain('"insights"');
  });

  it("instructs neutral tone", () => {
    const result = buildPositioningPrompt(baseCompanies, userUrl);
    expect(result).toContain("neutral positioning analyst");
    expect(result).toContain("neutral, objective analysis");
  });
});
