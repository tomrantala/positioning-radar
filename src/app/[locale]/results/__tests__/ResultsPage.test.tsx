import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResultsPage from "../[id]/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "test-123" }),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "v3.title": "Your Positioning Analysis",
      "v3.scoreLabel": "Positioning Score",
      "v3.excellent": "Excellent",
      "v3.good": "Good",
      "v3.needsWork": "Needs work",
      "v3.poor": "Poor",
      "v3.gateTitle": "See how you compare",
      "v3.gateDescription": "Enter your email to unlock the competitive landscape.",
      "v3.gateIncludes1": "Positioning map with all competitors",
      "v3.gateIncludes2": "Key market insights",
      "v3.gateIncludes3": "Differentiation scores for all companies",
      "v3.gateSubmit": "Unlock competitor view",
      "v3.gatePrivacy": "We'll only use this to send you the analysis.",
      "results.newAnalysis": "New analysis",
      "results.recommendations": "Recommendations",
      "results.map": "Positioning Map",
      "results.insights": "Key Observations",
      "results.score": "Differentiation Score",
      "results.scoreDescription": "How unique is each company",
      "footer.poweredBy": "Powered by",
      "footer.meom": "MEOM",
      "footer.tagline": "Tagline",
      "footer.privacy": "Privacy",
      "history.title": "Your recent analyses",
    };
    return translations[key] || key;
  },
  useLocale: () => "en",
}));

// Mock i18n navigation
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
vi.mock("@/components/ContactCTA", () => ({
  default: () => <div data-testid="contact-cta" />,
}));
vi.mock("@/components/AnalysisHistory", () => ({
  default: () => <div data-testid="analysis-history" />,
}));
vi.mock("@/lib/pdf-report", () => ({
  generateReport: () => ({ save: vi.fn() }),
}));
vi.mock("@/lib/analysis-history", () => ({
  saveToHistory: vi.fn(),
}));

const mockResult = {
  id: "test-123",
  created_at: "2026-03-09T00:00:00Z",
  industry_context: "SaaS / Software",
  user_company_url: "https://mycompany.com",
  axes: {
    x: { label: "Innovation", low_label: "Traditional", high_label: "Cutting-edge" },
    y: { label: "Market Focus", low_label: "Niche", high_label: "Broad" },
  },
  companies: [
    {
      name: "My Company",
      url: "https://mycompany.com",
      x_score: 50,
      y_score: 30,
      key_messages: ["Msg"],
      target_audience: "Devs",
      differentiation_summary: "Unique",
      differentiation_index: 75,
      positioning_health: {
        total_score: 72,
        best_customers: { score: 80, assessment: "Good" },
        competitive_alternatives: { score: 65, assessment: "OK" },
        unique_attributes: { score: 70, assessment: "Good" },
        value_creators: { score: 75, assessment: "Good" },
        category: { score: 68, assessment: "OK" },
        unique_value_propositions: { score: 74, assessment: "Good" },
      },
      five_second_test: {
        clarity_score: 7,
        first_impression: "Modern SaaS",
        identified_offering: "Developer tools",
        target_audience_guess: "Developers",
        emotional_tone: "Professional",
      },
      red_flags: ["generic_messaging"],
      red_flag_details: [
        { flag: "generic_messaging", severity: "medium", explanation: "Too generic", suggestion: "Be specific" },
      ],
    },
    {
      name: "Competitor A",
      url: "https://competitor-a.com",
      x_score: 70,
      y_score: 60,
      key_messages: ["Competitor msg"],
      target_audience: "Enterprise",
      differentiation_summary: "Different",
      differentiation_index: 60,
      positioning_health: {
        total_score: 55,
        best_customers: { score: 50, assessment: "OK" },
        competitive_alternatives: { score: 55, assessment: "OK" },
        unique_attributes: { score: 60, assessment: "OK" },
        value_creators: { score: 50, assessment: "OK" },
        category: { score: 55, assessment: "OK" },
        unique_value_propositions: { score: 60, assessment: "OK" },
      },
      five_second_test: {
        clarity_score: 5,
        first_impression: "Enterprise",
        identified_offering: "Enterprise tools",
        target_audience_guess: "Enterprise",
        emotional_tone: "Corporate",
      },
      red_flags: [],
      red_flag_details: [],
    },
  ],
  insights: ["Insight 1", "Insight 2"],
  recommendations: ["Do X", "Do Y"],
};

describe("ResultsPage (default — gauge layout)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    });
  });

  it("renders the gauge with the user company's health score", async () => {
    render(<ResultsPage />);

    await waitFor(() => {
      const gauge = screen.getByTestId("score-gauge");
      expect(gauge).toBeInTheDocument();
      expect(gauge.getAttribute("data-score")).toBe("72");
    });
  });

  it("shows user's company components with only the user's data", async () => {
    render(<ResultsPage />);

    await waitFor(() => {
      const fst = screen.getByTestId("five-second-test");
      expect(fst.getAttribute("data-count")).toBe("1");

      const hd = screen.getByTestId("health-detail");
      expect(hd.getAttribute("data-count")).toBe("1");

      const rf = screen.getByTestId("red-flags");
      expect(rf.getAttribute("data-count")).toBe("1");
    });
  });

  it("shows recommendations for free", async () => {
    render(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText("Do X")).toBeInTheDocument();
      expect(screen.getByText("Do Y")).toBeInTheDocument();
    });
  });

  it("does NOT show competitor content before email unlock", async () => {
    render(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("score-gauge")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("positioning-map")).not.toBeInTheDocument();
    expect(screen.queryByTestId("insight-cards")).not.toBeInTheDocument();
    expect(screen.queryByTestId("differentiation-score")).not.toBeInTheDocument();
  });

  it("unlocks competitor content after email submission", async () => {
    const user = userEvent.setup();
    render(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText("See how you compare")).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText("your@email.com");
    await user.type(emailInput, "test@example.com");
    const submitButton = screen.getByText("Unlock competitor view");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("positioning-map")).toBeInTheDocument();
      expect(screen.getByTestId("insight-cards")).toBeInTheDocument();
      expect(screen.getByTestId("differentiation-score")).toBeInTheDocument();
    });

    expect(screen.queryByText("See how you compare")).not.toBeInTheDocument();
  });

  it("posts email with source v3_competitor_unlock", async () => {
    const user = userEvent.setup();
    render(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText("See how you compare")).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText("your@email.com");
    await user.type(emailInput, "lead@test.com");
    await user.click(screen.getByText("Unlock competitor view"));

    await waitFor(() => {
      const fetchCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
      const subscribeCalls = fetchCalls.filter(
        (call) => typeof call[0] === "string" && call[0].includes("/api/subscribe")
      );
      expect(subscribeCalls.length).toBe(1);

      const body = JSON.parse(subscribeCalls[0][1].body);
      expect(body.email).toBe("lead@test.com");
      expect(body.source).toBe("v3_competitor_unlock");
      expect(body.analysis_id).toBe("test-123");
    });
  });
});
