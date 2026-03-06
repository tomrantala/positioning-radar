import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PositioningHealthScore from "@/components/PositioningHealthScore";
import type { CompanyAnalysis } from "@/lib/types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Positioning Health Score",
      description: "Overall positioning strength",
      basedOn: "Based on 6 positioning elements",
      you: "You",
    };
    return translations[key] || key;
  },
}));

const mockHealth = {
  total_score: 72,
  best_customers: { score: 80, summary: "Clear target" },
  competitive_alternatives: { score: 60, summary: "Some awareness" },
  unique_attributes: { score: 75, summary: "Good differentiators" },
  value_creators: { score: 70, summary: "Value shown" },
  category: { score: 85, summary: "Clear category" },
  unique_value_propositions: { score: 62, summary: "Moderate uniqueness" },
};

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
    positioning_health: mockHealth,
    ...overrides,
  };
}

describe("PositioningHealthScore", () => {
  it("renders section title and description", () => {
    render(
      <PositioningHealthScore
        companies={[makeCompany()]}
        userCompanyUrl="https://test.com"
      />
    );

    expect(screen.getByText("Positioning Health Score")).toBeInTheDocument();
    expect(
      screen.getByText("Overall positioning strength")
    ).toBeInTheDocument();
  });

  it("displays total score prominently", () => {
    render(
      <PositioningHealthScore
        companies={[makeCompany()]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("shows 'Based on 6 positioning elements' label", () => {
    render(
      <PositioningHealthScore
        companies={[makeCompany()]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(
      screen.getByText("Based on 6 positioning elements")
    ).toBeInTheDocument();
  });

  it("highlights user company with 'You' badge", () => {
    render(
      <PositioningHealthScore
        companies={[
          makeCompany({ url: "https://user.com", name: "User Co" }),
        ]}
        userCompanyUrl="https://user.com"
      />
    );

    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("renders multiple companies", () => {
    render(
      <PositioningHealthScore
        companies={[
          makeCompany({ name: "Company A", url: "https://a.com" }),
          makeCompany({
            name: "Company B",
            url: "https://b.com",
            positioning_health: { ...mockHealth, total_score: 45 },
          }),
        ]}
        userCompanyUrl="https://a.com"
      />
    );

    expect(screen.getByText("Company A")).toBeInTheDocument();
    expect(screen.getByText("Company B")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("skips companies without positioning_health data", () => {
    const company = makeCompany({ name: "No Health" });
    delete company.positioning_health;

    render(
      <PositioningHealthScore
        companies={[company]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.queryByText("No Health")).not.toBeInTheDocument();
  });
});
