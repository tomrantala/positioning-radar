import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RedFlags from "@/components/RedFlags";
import type { CompanyAnalysis } from "@/lib/types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Red Flags",
      description: "Positioning problems detected",
      generic_terminology: "Generic Terminology",
      self_focused_language: "Self-Focused Language",
      missing_pain_points: "Missing Pain Points",
      buzzword_overload: "Buzzword Overload",
      interchangeable_messaging: "Interchangeable Messaging",
      noFlags: "No red flags",
      example: "Example",
      suggestion: "Suggestion",
      you: "You",
    };
    return translations[key] || key;
  },
}));

function makeCompany(
  overrides: Partial<CompanyAnalysis> = {}
): CompanyAnalysis {
  return {
    name: "Test Company",
    url: "https://test.com",
    x_score: 50,
    y_score: 30,
    key_messages: ["Message 1"],
    target_audience: "Developers",
    differentiation_summary: "Unique approach",
    differentiation_index: 75,
    red_flags: ["generic_terminology"],
    red_flag_details: [
      {
        type: "generic_terminology",
        example: "We deliver excellence",
        suggestion: "Replace with specific outcomes",
      },
    ],
    ...overrides,
  };
}

describe("RedFlags", () => {
  it("renders section title and description", () => {
    render(
      <RedFlags
        companies={[makeCompany()]}
        userCompanyUrl="https://test.com"
      />
    );

    expect(screen.getByText("Red Flags")).toBeInTheDocument();
    expect(
      screen.getByText("Positioning problems detected")
    ).toBeInTheDocument();
  });

  it("shows flag type badge", () => {
    render(
      <RedFlags
        companies={[makeCompany()]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.getByText(/Generic Terminology/)).toBeInTheDocument();
  });

  it("expands flag details on click", async () => {
    const user = userEvent.setup();
    render(
      <RedFlags
        companies={[makeCompany()]}
        userCompanyUrl="https://other.com"
      />
    );

    // Details should be hidden initially
    expect(screen.queryByText(/We deliver excellence/)).not.toBeInTheDocument();

    // Click to expand
    await user.click(screen.getByText(/Generic Terminology/));

    // Details should now be visible
    expect(screen.getByText(/We deliver excellence/)).toBeInTheDocument();
    expect(
      screen.getByText(/Replace with specific outcomes/)
    ).toBeInTheDocument();
  });

  it("shows 'No red flags' for companies without flags", () => {
    render(
      <RedFlags
        companies={[
          makeCompany({
            name: "Clean Co",
            red_flags: [],
            red_flag_details: [],
          }),
        ]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.getByText("No red flags")).toBeInTheDocument();
  });

  it("highlights user company with 'You' badge", () => {
    render(
      <RedFlags
        companies={[
          makeCompany({ url: "https://user.com", name: "User Co" }),
        ]}
        userCompanyUrl="https://user.com"
      />
    );

    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("renders multiple flag types for one company", () => {
    render(
      <RedFlags
        companies={[
          makeCompany({
            red_flags: ["generic_terminology", "buzzword_overload"],
            red_flag_details: [
              {
                type: "generic_terminology",
                example: "We deliver excellence",
                suggestion: "Be specific",
              },
              {
                type: "buzzword_overload",
                example: "Synergistic solutions",
                suggestion: "Use plain language",
              },
            ],
          }),
        ]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.getByText(/Generic Terminology/)).toBeInTheDocument();
    expect(screen.getByText(/Buzzword Overload/)).toBeInTheDocument();
  });
});
