import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PositioningHealthDetail from "@/components/PositioningHealthDetail";
import type { CompanyAnalysis } from "@/lib/types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "6-Element Positioning Breakdown",
      description: "Detailed scoring across 6 elements",
      best_customers: "Best Customers",
      competitive_alternatives: "Competitive Alternatives",
      unique_attributes: "Unique Attributes",
      value_creators: "Value Creators",
      category: "Category",
      unique_value_propositions: "Unique Value Propositions",
      you: "You",
    };
    return translations[key] || key;
  },
}));

const mockHealth = {
  total_score: 65,
  best_customers: { score: 80, summary: "Clear target audience" },
  competitive_alternatives: { score: 50, summary: "Limited awareness" },
  unique_attributes: { score: 60, summary: "Some differentiators" },
  value_creators: { score: 75, summary: "Good value clarity" },
  category: { score: 70, summary: "Category clear" },
  unique_value_propositions: { score: 55, summary: "Moderate uniqueness" },
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

describe("PositioningHealthDetail", () => {
  it("renders section title and description", () => {
    render(
      <PositioningHealthDetail
        companies={[makeCompany()]}
        userCompanyUrl="https://test.com"
      />
    );

    expect(
      screen.getByText("6-Element Positioning Breakdown")
    ).toBeInTheDocument();
  });

  it("renders each element as a separate card", () => {
    render(
      <PositioningHealthDetail
        companies={[makeCompany()]}
        userCompanyUrl="https://test.com"
      />
    );

    // Each element should have its own card with a heading
    const cards = screen.getAllByTestId("health-element-card");
    expect(cards).toHaveLength(6);
  });

  it("displays all 6 element names as card headings", () => {
    render(
      <PositioningHealthDetail
        companies={[makeCompany()]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.getByText("Best Customers")).toBeInTheDocument();
    expect(screen.getByText("Competitive Alternatives")).toBeInTheDocument();
    expect(screen.getByText("Unique Attributes")).toBeInTheDocument();
    expect(screen.getByText("Value Creators")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Unique Value Propositions")).toBeInTheDocument();
  });

  it("displays element scores", () => {
    render(
      <PositioningHealthDetail
        companies={[makeCompany()]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();
  });

  it("displays element summaries", () => {
    render(
      <PositioningHealthDetail
        companies={[makeCompany()]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.getByText("Clear target audience")).toBeInTheDocument();
    expect(screen.getByText("Limited awareness")).toBeInTheDocument();
    expect(screen.getByText("Good value clarity")).toBeInTheDocument();
    expect(screen.getByText("Category clear")).toBeInTheDocument();
    expect(screen.getByText("Moderate uniqueness")).toBeInTheDocument();
  });

  it("skips companies without positioning_health data", () => {
    const company = makeCompany({ name: "No Health" });
    delete company.positioning_health;

    render(
      <PositioningHealthDetail
        companies={[company]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.queryByTestId("health-element-card")).not.toBeInTheDocument();
  });
});
