import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmailGate from "@/components/EmailGate";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Unlock the full 6-element breakdown",
      description: "Enter your email to see detailed scores.",
      includes1: "6-element breakdown per company",
      includes2: "Element-level scores with explanations",
      includes3: "Actionable recommendations",
      emailPlaceholder: "your@email.com",
      submit: "Unlock full analysis",
      sending: "Unlocking...",
      privacy: "We'll only contact you about your analysis.",
    };
    return translations[key] || key;
  },
}));

describe("EmailGate", () => {
  const mockOnUnlock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  it("renders gate title and description", () => {
    render(<EmailGate analysisId="test-123" onUnlock={mockOnUnlock} />);

    expect(
      screen.getByText("Unlock the full 6-element breakdown")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter your email to see detailed scores.")
    ).toBeInTheDocument();
  });

  it("lists what user gets", () => {
    render(<EmailGate analysisId="test-123" onUnlock={mockOnUnlock} />);

    expect(
      screen.getByText("6-element breakdown per company")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Element-level scores with explanations")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Actionable recommendations")
    ).toBeInTheDocument();
  });

  it("shows email input and submit button", () => {
    render(<EmailGate analysisId="test-123" onUnlock={mockOnUnlock} />);

    expect(
      screen.getByPlaceholderText("your@email.com")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Unlock full analysis" })
    ).toBeInTheDocument();
  });

  it("calls onUnlock after form submission", async () => {
    const user = userEvent.setup();
    render(<EmailGate analysisId="test-123" onUnlock={mockOnUnlock} />);

    await user.type(
      screen.getByPlaceholderText("your@email.com"),
      "test@example.com"
    );
    await user.click(
      screen.getByRole("button", { name: "Unlock full analysis" })
    );

    expect(mockOnUnlock).toHaveBeenCalledTimes(1);
  });

  it("sends correct data to /api/subscribe", async () => {
    const user = userEvent.setup();
    render(<EmailGate analysisId="test-123" onUnlock={mockOnUnlock} />);

    await user.type(
      screen.getByPlaceholderText("your@email.com"),
      "test@example.com"
    );
    await user.click(
      screen.getByRole("button", { name: "Unlock full analysis" })
    );

    expect(global.fetch).toHaveBeenCalledWith("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        analysis_id: "test-123",
        source: "positioning_health_detail",
      }),
    });
  });

  it("still calls onUnlock when fetch fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error")
    );
    const user = userEvent.setup();
    render(<EmailGate analysisId="test-123" onUnlock={mockOnUnlock} />);

    await user.type(
      screen.getByPlaceholderText("your@email.com"),
      "test@example.com"
    );
    await user.click(
      screen.getByRole("button", { name: "Unlock full analysis" })
    );

    expect(mockOnUnlock).toHaveBeenCalledTimes(1);
  });

  it("shows privacy notice", () => {
    render(<EmailGate analysisId="test-123" onUnlock={mockOnUnlock} />);

    expect(
      screen.getByText("We'll only contact you about your analysis.")
    ).toBeInTheDocument();
  });
});
