import { describe, it, expect } from "vitest";
import { generateReport } from "./pdf-report";
import { PositioningResult } from "./types";

/** Helper: create a minimal valid PositioningResult */
function makeResult(overrides?: Partial<PositioningResult>): PositioningResult {
  return {
    id: "test-123",
    created_at: "2026-03-08T12:00:00Z",
    industry_context: "B2B web design and development services",
    user_company_url: "https://example.com",
    axes: {
      x: { label: "Focus", low_label: "Niche", high_label: "Full-service" },
      y: { label: "Approach", low_label: "Template", high_label: "Custom" },
    },
    companies: [
      {
        name: "Example Corp",
        url: "https://example.com",
        x_score: 40,
        y_score: 60,
        key_messages: ["We build fast websites"],
        target_audience: "SMBs",
        differentiation_summary: "Speed-focused web agency",
        differentiation_index: 72,
      },
      {
        name: "Rival Inc",
        url: "https://rival.com",
        x_score: -30,
        y_score: -20,
        key_messages: ["Enterprise solutions"],
        target_audience: "Large enterprises",
        differentiation_summary: "Enterprise-grade agency",
        differentiation_index: 55,
      },
    ],
    insights: [
      "Example Corp occupies a unique position in the speed-focused niche",
      "Rival Inc targets a very different audience segment",
    ],
    ...overrides,
  };
}

describe("generateReport", () => {
  it("generates a valid PDF containing company names", () => {
    const result = makeResult();
    const doc = generateReport(result);
    const pdfBytes = doc.output("arraybuffer");
    const pdfString = new TextDecoder("latin1").decode(pdfBytes);

    // Valid PDF
    expect(pdfString).toMatch(/^%PDF-/);

    // Contains company names
    expect(pdfString).toContain("Example Corp");
    expect(pdfString).toContain("Rival Inc");
  });

  it("contains industry context and insights", () => {
    const result = makeResult();
    const doc = generateReport(result);
    const pdfString = new TextDecoder("latin1").decode(doc.output("arraybuffer"));

    expect(pdfString).toContain("B2B web design and development services");
    expect(pdfString).toContain("Example Corp occupies a unique position");
    expect(pdfString).toContain("Rival Inc targets a very different");
  });

  it("contains 5-second test results when present", () => {
    const result = makeResult({
      companies: [
        {
          name: "TestCo",
          url: "https://testco.com",
          x_score: 10,
          y_score: 20,
          key_messages: ["Test"],
          target_audience: "Devs",
          differentiation_summary: "Test company",
          differentiation_index: 50,
          five_second_test: {
            result: "pass",
            what_visitor_understands: "Clear value proposition about testing tools",
            what_is_unclear: "Pricing model not immediately visible",
          },
        },
      ],
    });
    const pdfString = new TextDecoder("latin1").decode(
      generateReport(result).output("arraybuffer")
    );

    expect(pdfString).toContain("5 Second Test");
    expect(pdfString).toContain("PASS");
    expect(pdfString).toContain("Clear value proposition about testing tools");
    expect(pdfString).toContain("Pricing model not immediately visible");
  });

  it("contains health scores when present", () => {
    const result = makeResult({
      companies: [
        {
          name: "HealthCo",
          url: "https://healthco.com",
          x_score: 0,
          y_score: 0,
          key_messages: ["Health"],
          target_audience: "All",
          differentiation_summary: "Health company",
          differentiation_index: 60,
          positioning_health: {
            total_score: 73,
            best_customers: { score: 80, summary: "Clear target audience" },
            competitive_alternatives: { score: 65, summary: "Some overlap with competitors" },
            unique_attributes: { score: 70, summary: "Good unique features" },
            value_creators: { score: 75, summary: "Strong value delivery" },
            category: { score: 85, summary: "Well-defined category" },
            unique_value_propositions: { score: 63, summary: "Needs sharper UVP" },
          },
        },
      ],
    });
    const pdfString = new TextDecoder("latin1").decode(
      generateReport(result).output("arraybuffer")
    );

    expect(pdfString).toContain("Positioning Health");
    expect(pdfString).toContain("73/100");
    expect(pdfString).toContain("Clear target audience");
    expect(pdfString).toContain("Needs sharper UVP");
  });

  it("contains red flags when present", () => {
    const result = makeResult({
      companies: [
        {
          name: "FlagCo",
          url: "https://flagco.com",
          x_score: 0,
          y_score: 0,
          key_messages: ["Flag"],
          target_audience: "All",
          differentiation_summary: "Flagged company",
          differentiation_index: 40,
          red_flag_details: [
            {
              type: "generic_terminology",
              example: "We provide solutions for your business needs",
              suggestion: "Replace with specific outcomes",
            },
            {
              type: "buzzword_overload",
              example: "Synergistic paradigm-shifting innovation",
              suggestion: "Use plain language that customers understand",
            },
          ],
        },
      ],
    });
    const pdfString = new TextDecoder("latin1").decode(
      generateReport(result).output("arraybuffer")
    );

    expect(pdfString).toContain("Red Flags");
    expect(pdfString).toContain("We provide solutions for your business needs");
    expect(pdfString).toContain("Replace with specific outcomes");
  });

  it("handles backward-compatible data without v2 fields", () => {
    const result = makeResult(); // no five_second_test, no positioning_health, no red_flags
    const doc = generateReport(result);
    const pdfString = new TextDecoder("latin1").decode(doc.output("arraybuffer"));

    // Should still generate a valid PDF
    expect(pdfString).toMatch(/^%PDF-/);
    expect(pdfString).toContain("Example Corp");

    // Should NOT contain v2 section headers
    expect(pdfString).not.toContain("5 Second Test");
    expect(pdfString).not.toContain("Positioning Health");
    expect(pdfString).not.toContain("Red Flags");
  });
});
