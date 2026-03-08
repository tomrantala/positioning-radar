import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnalysisHistory from "../AnalysisHistory";
import * as historyModule from "@/lib/analysis-history";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "history.title": "Your recent analyses",
      "history.clear": "Clear history",
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

const mockEntries: historyModule.HistoryEntry[] = [
  {
    id: "abc-123",
    userUrl: "https://meom.fi",
    industry: "SaaS / Software",
    createdAt: new Date().toISOString(),
    locale: "en",
  },
  {
    id: "xyz-456",
    userUrl: "https://example.com",
    industry: "Consulting",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    locale: "en",
  },
];

describe("AnalysisHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(historyModule, "getHistory").mockReturnValue(mockEntries);
    vi.spyOn(historyModule, "clearHistory").mockImplementation(() => {});
  });

  it("renders history entries with URLs in full variant", () => {
    render(<AnalysisHistory variant="full" />);
    expect(screen.getByText("Your recent analyses")).toBeInTheDocument();
    expect(screen.getByText("meom.fi")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  it("clears history and hides entries when Clear button is clicked", async () => {
    const user = userEvent.setup();

    // First render: entries visible
    vi.spyOn(historyModule, "getHistory").mockReturnValue([...mockEntries]);
    const { rerender } = render(<AnalysisHistory variant="full" />);
    expect(screen.getByText("meom.fi")).toBeInTheDocument();

    // Click clear → getHistory returns empty
    vi.spyOn(historyModule, "getHistory").mockReturnValue([]);
    await user.click(screen.getByText("Clear history"));
    rerender(<AnalysisHistory variant="full" />);

    expect(historyModule.clearHistory).toHaveBeenCalled();
    expect(screen.queryByText("meom.fi")).not.toBeInTheDocument();
  });
});
