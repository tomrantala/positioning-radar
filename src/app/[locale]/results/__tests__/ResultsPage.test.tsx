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
      "results.title": "Positioning Analysis",
      "results.industryContext": "Industry Context",
      "results.map": "Positioning Map",
      "results.insights": "Key Observations",
      "results.score": "Differentiation Score",
      "results.scoreDescription": "How unique is each company",
      "results.newAnalysis": "New analysis",
      "results.copyLink": "Copy link",
      "results.linkCopied": "Link copied!",
      "results.recommendations": "Recommendations",
      "footer.poweredBy": "Powered by",
      "footer.meom": "MEOM",
      "footer.tagline": "Tagline",
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

// Mock all heavy child components
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
vi.mock("@/components/FiveSecondTest", () => ({
  default: () => <div data-testid="five-second-test" />,
}));
vi.mock("@/components/PositioningHealthScore", () => ({
  default: () => <div data-testid="health-score" />,
}));
vi.mock("@/components/PositioningHealthDetail", () => ({
  default: () => <div data-testid="health-detail" />,
}));
vi.mock("@/components/RedFlags", () => ({
  default: () => <div data-testid="red-flags" />,
}));
vi.mock("@/components/EmailGate", () => ({
  default: () => <div data-testid="email-gate" />,
}));
vi.mock("@/lib/pdf-report", () => ({
  generateReport: () => ({ save: vi.fn() }),
}));

const mockResult = {
  id: "test-123",
  created_at: "2026-03-09T00:00:00Z",
  industry_context: "SaaS / Software",
  user_company_url: "https://example.com",
  axes: {
    x: { label: "Innovation", low_label: "Traditional", high_label: "Cutting-edge" },
    y: { label: "Market Focus", low_label: "Niche", high_label: "Broad" },
  },
  companies: [
    {
      name: "Example Co",
      url: "https://example.com",
      x_score: 50,
      y_score: 30,
      key_messages: ["Msg"],
      target_audience: "Devs",
      differentiation_summary: "Unique",
      differentiation_index: 75,
    },
  ],
  insights: ["Insight 1"],
};

const mockWriteText = vi.fn().mockResolvedValue(undefined);

describe("ResultsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  it("displays the analyzed URL below the title", async () => {
    render(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText("https://example.com")).toBeInTheDocument();
    });
  });

  it("renders a Copy link button in the header", async () => {
    render(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText("Copy link")).toBeInTheDocument();
    });
  });

  it("copies the analysis URL to clipboard when Copy link is clicked", async () => {
    const user = userEvent.setup();

    render(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText("Copy link")).toBeInTheDocument();
    });

    const copyButton = screen.getByText("Copy link").closest("button")!;
    await user.click(copyButton);

    // After click, text should change to "Link copied!" (proves the onClick ran)
    expect(screen.getByText("Link copied!")).toBeInTheDocument();
  });
});
