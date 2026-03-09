import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ReportDetailPage from "../[slug]/page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "crm" }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "reports.backToReports": "All reports",
      "reports.analyzeYours": "Analyze your own positioning",
      "reports.crm.title": "CRM Platforms",
      "results.map": "Positioning Map",
      "results.insights": "Key Observations",
      "results.score": "Differentiation Score",
      "results.scoreDescription": "How unique each company is",
      "results.recommendations": "Recommendations",
      "footer.poweredBy": "Powered by",
      "footer.meom": "MEOM",
      "footer.tagline": "Tagline",
      "footer.privacy": "Privacy",
    };
    return translations[key] || key;
  },
  useLocale: () => "en",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock child components
vi.mock("@/components/PositioningScoreGauge", () => ({
  default: ({ score }: { score: number }) => (
    <div data-testid="score-gauge" data-score={score} />
  ),
}));
vi.mock("@/components/FiveSecondTest", () => ({
  default: ({ companies }: { companies: unknown[] }) => (
    <div data-testid="five-second-test" data-count={companies.length} />
  ),
}));
vi.mock("@/components/PositioningHealthDetail", () => ({
  default: ({ companies }: { companies: unknown[] }) => (
    <div data-testid="health-detail" data-count={companies.length} />
  ),
}));
vi.mock("@/components/RedFlags", () => ({
  default: ({ companies }: { companies: unknown[] }) => (
    <div data-testid="red-flags" data-count={companies.length} />
  ),
}));
vi.mock("@/components/PositioningMap", () => ({
  default: () => <div data-testid="positioning-map" />,
}));
vi.mock("@/components/InsightCards", () => ({
  default: () => <div data-testid="insight-cards" />,
}));
vi.mock("@/components/DifferentiationScore", () => ({
  default: () => <div data-testid="differentiation-score" />,
}));

describe("ReportDetailPage", () => {
  it("renders the report title", () => {
    render(<ReportDetailPage />);
    expect(screen.getByText("CRM Platforms")).toBeInTheDocument();
  });

  it("renders the positioning score gauge for the first company", () => {
    render(<ReportDetailPage />);
    const gauge = screen.getByTestId("score-gauge");
    expect(gauge).toBeInTheDocument();
    expect(gauge.getAttribute("data-score")).toBe("78"); // HubSpot's score
  });

  it("renders positioning map with all companies (no gating)", () => {
    render(<ReportDetailPage />);
    expect(screen.getByTestId("positioning-map")).toBeInTheDocument();
  });

  it("renders insights and differentiation scores (no gating)", () => {
    render(<ReportDetailPage />);
    expect(screen.getByTestId("insight-cards")).toBeInTheDocument();
    expect(screen.getByTestId("differentiation-score")).toBeInTheDocument();
  });

  it("renders health detail for all companies", () => {
    render(<ReportDetailPage />);
    const hd = screen.getByTestId("health-detail");
    expect(hd.getAttribute("data-count")).toBe("3"); // All 3 CRM companies
  });

  it("renders recommendations", () => {
    render(<ReportDetailPage />);
    expect(screen.getByText(/Study Pipedrive/)).toBeInTheDocument();
  });

  it("links back to reports index", () => {
    render(<ReportDetailPage />);
    const backLink = screen.getByText(/All reports/);
    expect(backLink.closest("a")).toHaveAttribute("href", "/reports");
  });

  it("includes CTA to analyze your own", () => {
    render(<ReportDetailPage />);
    const ctas = screen.getAllByText("Analyze your own positioning");
    expect(ctas.length).toBeGreaterThanOrEqual(1);
  });
});
