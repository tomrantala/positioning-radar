import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PositioningMap from "@/components/PositioningMap";
import type { CompanyAnalysis, PositioningAxis } from "@/lib/types";

// Mock Recharts — SVG rendering doesn't work in jsdom
vi.mock("recharts", () => ({
  ScatterChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scatter-chart">{children}</div>
  ),
  Scatter: ({ name, data, children }: { name: string; data: unknown[]; children?: React.ReactNode }) => (
    <div data-testid={`scatter-${name}`} data-count={data.length}>{children}</div>
  ),
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Label: () => <div />,
  LabelList: () => <div />,
  ReferenceLine: () => <div />,
}));

const axes: { x: PositioningAxis; y: PositioningAxis } = {
  x: {
    label: "Innovation",
    low_label: "Traditional",
    high_label: "Cutting-edge",
  },
  y: {
    label: "Market Focus",
    low_label: "Niche",
    high_label: "Broad market",
  },
};

function makeCompany(overrides: Partial<CompanyAnalysis> = {}): CompanyAnalysis {
  return {
    name: "Test Company",
    url: "https://test.com",
    x_score: 50,
    y_score: 30,
    key_messages: ["Message 1", "Message 2"],
    target_audience: "Developers",
    differentiation_summary: "Unique approach",
    differentiation_index: 75,
    ...overrides,
  };
}

describe("PositioningMap", () => {
  it("renders without crashing", () => {
    render(
      <PositioningMap
        companies={[makeCompany()]}
        axes={axes}
        userCompanyUrl="https://test.com"
      />
    );

    expect(screen.getByTestId("scatter-chart")).toBeInTheDocument();
  });

  it("displays axis labels", () => {
    render(
      <PositioningMap
        companies={[makeCompany()]}
        axes={axes}
        userCompanyUrl="https://test.com"
      />
    );

    expect(screen.getByText("Traditional")).toBeInTheDocument();
    expect(screen.getByText("Cutting-edge")).toBeInTheDocument();
    expect(screen.getByText("Niche")).toBeInTheDocument();
    expect(screen.getByText("Broad market")).toBeInTheDocument();
  });

  it("separates user company from competitors", () => {
    const companies = [
      makeCompany({ name: "User Co", url: "https://user.com" }),
      makeCompany({ name: "Comp A", url: "https://comp-a.com" }),
      makeCompany({ name: "Comp B", url: "https://comp-b.com" }),
    ];

    render(
      <PositioningMap
        companies={companies}
        axes={axes}
        userCompanyUrl="https://user.com"
      />
    );

    const userScatter = screen.getByTestId("scatter-Your company");
    const compScatter = screen.getByTestId("scatter-Competitors");

    expect(userScatter).toHaveAttribute("data-count", "1");
    expect(compScatter).toHaveAttribute("data-count", "2");
  });

  it("shows legend with correct labels", () => {
    render(
      <PositioningMap
        companies={[makeCompany()]}
        axes={axes}
        userCompanyUrl="https://test.com"
      />
    );

    expect(screen.getByText("Your company")).toBeInTheDocument();
    expect(screen.getByText("Competitors")).toBeInTheDocument();
  });

  it("handles empty companies array", () => {
    render(
      <PositioningMap
        companies={[]}
        axes={axes}
        userCompanyUrl="https://test.com"
      />
    );

    const userScatter = screen.getByTestId("scatter-Your company");
    const compScatter = screen.getByTestId("scatter-Competitors");

    expect(userScatter).toHaveAttribute("data-count", "0");
    expect(compScatter).toHaveAttribute("data-count", "0");
  });

  it("puts all companies in competitors when no URL matches", () => {
    const companies = [
      makeCompany({ url: "https://a.com" }),
      makeCompany({ url: "https://b.com" }),
    ];

    render(
      <PositioningMap
        companies={companies}
        axes={axes}
        userCompanyUrl="https://nonexistent.com"
      />
    );

    const compScatter = screen.getByTestId("scatter-Competitors");
    expect(compScatter).toHaveAttribute("data-count", "2");
  });
});
