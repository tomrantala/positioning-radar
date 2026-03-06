import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FiveSecondTest from "@/components/FiveSecondTest";
import type { CompanyAnalysis } from "@/lib/types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "5 Second Test",
      description: "Would an outsider understand in 5 seconds?",
      pass: "PASS",
      partial: "PARTIAL",
      fail: "FAIL",
      understands: "Visitor understands",
      unclear: "Unclear",
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
    five_second_test: {
      result: "pass",
      what_visitor_understands: "They build software tools",
      what_is_unclear: "",
    },
    ...overrides,
  };
}

describe("FiveSecondTest", () => {
  it("renders section title and description", () => {
    render(
      <FiveSecondTest
        companies={[makeCompany()]}
        userCompanyUrl="https://test.com"
      />
    );

    expect(screen.getByText("5 Second Test")).toBeInTheDocument();
    expect(
      screen.getByText("Would an outsider understand in 5 seconds?")
    ).toBeInTheDocument();
  });

  it("shows PASS badge for passing result", () => {
    render(
      <FiveSecondTest
        companies={[makeCompany({ five_second_test: { result: "pass", what_visitor_understands: "Clear messaging", what_is_unclear: "" } })]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.getByText("PASS")).toBeInTheDocument();
  });

  it("shows PARTIAL badge for partial result", () => {
    render(
      <FiveSecondTest
        companies={[makeCompany({ five_second_test: { result: "partial", what_visitor_understands: "Something about tech", what_is_unclear: "Target audience unclear" } })]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.getByText("PARTIAL")).toBeInTheDocument();
    expect(screen.getByText(/Target audience unclear/)).toBeInTheDocument();
  });

  it("shows FAIL badge for failing result", () => {
    render(
      <FiveSecondTest
        companies={[makeCompany({ five_second_test: { result: "fail", what_visitor_understands: "Nothing clear", what_is_unclear: "Everything" } })]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.getByText("FAIL")).toBeInTheDocument();
  });

  it("highlights user company with 'You' badge", () => {
    render(
      <FiveSecondTest
        companies={[makeCompany({ url: "https://user.com", name: "User Co" })]}
        userCompanyUrl="https://user.com"
      />
    );

    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("does not show 'You' badge for competitors", () => {
    render(
      <FiveSecondTest
        companies={[makeCompany({ url: "https://comp.com", name: "Competitor" })]}
        userCompanyUrl="https://user.com"
      />
    );

    expect(screen.queryByText("You")).not.toBeInTheDocument();
  });

  it("hides unclear section when empty string", () => {
    render(
      <FiveSecondTest
        companies={[makeCompany({ five_second_test: { result: "pass", what_visitor_understands: "Clear", what_is_unclear: "" } })]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.queryByText("Unclear:")).not.toBeInTheDocument();
  });

  it("skips companies without five_second_test data", () => {
    const company = makeCompany({ name: "No Test Co" });
    delete company.five_second_test;

    render(
      <FiveSecondTest
        companies={[company]}
        userCompanyUrl="https://other.com"
      />
    );

    expect(screen.queryByText("No Test Co")).not.toBeInTheDocument();
  });
});
