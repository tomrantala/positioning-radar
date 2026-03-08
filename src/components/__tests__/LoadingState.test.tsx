import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import LoadingState from "../LoadingState";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      scraping: "Scanning websites...",
      analyzing: "Analyzing positioning...",
      generating: "Generating report...",
      patience: "This may take a moment",
      emailPrompt: "Taking a while? We can email you the results.",
      emailPlaceholder: "your@email.com",
      emailSubmit: "Send results to email",
      emailSent: "We'll send you the results when ready!",
    };
    return translations[key] || key;
  },
}));

describe("LoadingState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not show email form initially", () => {
    render(
      <LoadingState stage="scraping" onEmailSubmit={vi.fn()} />
    );

    expect(screen.queryByPlaceholderText("your@email.com")).not.toBeInTheDocument();
  });

  it("shows email form after 15 seconds", () => {
    render(
      <LoadingState stage="analyzing" onEmailSubmit={vi.fn()} />
    );

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByText("Send results to email")).toBeInTheDocument();
  });

  it("calls onEmailSubmit with email value on form submit", () => {
    const onEmailSubmit = vi.fn();

    render(
      <LoadingState stage="analyzing" onEmailSubmit={onEmailSubmit} />
    );

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    const input = screen.getByPlaceholderText("your@email.com");
    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.submit(input.closest("form")!);

    expect(onEmailSubmit).toHaveBeenCalledWith("test@example.com");
  });

  it("shows confirmation when emailSent is true", () => {
    render(
      <LoadingState stage="analyzing" onEmailSubmit={vi.fn()} emailSent={true} />
    );

    expect(screen.getByText("We'll send you the results when ready!")).toBeInTheDocument();
    // Email form should NOT be visible
    expect(screen.queryByPlaceholderText("your@email.com")).not.toBeInTheDocument();
  });

  it("does not show email form when onEmailSubmit is not provided", () => {
    render(<LoadingState stage="analyzing" />);

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    // Should NOT show email form — backward compatible
    expect(screen.queryByPlaceholderText("your@email.com")).not.toBeInTheDocument();
  });
});
