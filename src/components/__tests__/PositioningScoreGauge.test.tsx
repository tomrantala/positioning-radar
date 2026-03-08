import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PositioningScoreGauge from "../PositioningScoreGauge";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      scoreLabel: "Positioning Score",
      excellent: "Excellent",
      good: "Good",
      needsWork: "Needs work",
      poor: "Poor",
    };
    return translations[key] || key;
  },
}));

describe("PositioningScoreGauge", () => {
  it("renders the score number and label", () => {
    render(<PositioningScoreGauge score={72} />);

    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("Positioning Score")).toBeInTheDocument();
  });

  it("shows correct rating label based on score", () => {
    const { rerender } = render(<PositioningScoreGauge score={85} />);
    expect(screen.getByText("Excellent")).toBeInTheDocument();

    rerender(<PositioningScoreGauge score={72} />);
    expect(screen.getByText("Good")).toBeInTheDocument();

    rerender(<PositioningScoreGauge score={55} />);
    expect(screen.getByText("Needs work")).toBeInTheDocument();

    rerender(<PositioningScoreGauge score={30} />);
    expect(screen.getByText("Poor")).toBeInTheDocument();
  });

  it("renders the company URL when provided", () => {
    render(<PositioningScoreGauge score={72} companyUrl="https://example.com" />);

    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });
});
