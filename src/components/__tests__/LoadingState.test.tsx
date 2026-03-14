import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import LoadingState from "../LoadingState";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      scraping: "Scanning websites...",
      analyzing: "Analyzing positioning...",
      generating: "Generating report...",
      patience: "This takes about 1–2 minutes",
      emailPrompt: "Taking a while? We can email you the results.",
      emailPlaceholder: "your@email.com",
      emailSubmit: "Send results to email",
      emailSent: "We'll send you the results when ready!",
      // Step counter
      step: "Step {current} of {total}",
      // Sub-messages
      scraping_sub1: "Knocking on the front door...",
      scraping_sub2: "Reading between the lines...",
      scraping_sub3: "Decoding the messaging DNA...",
      analyzing_sub1: "Putting companies side by side...",
      analyzing_sub2: "Hunting for blind spots...",
      analyzing_sub3: "Measuring the uniqueness factor...",
      generating_sub1: "Brewing up your insights...",
      generating_sub2: "Connecting the dots...",
      generating_sub3: "Polishing the final report...",
      // Facts
      fact1: "83% of B2B buyers say positioning clarity directly affects their purchase decision.",
      fact2: "Companies with clear positioning grow 2x faster than competitors.",
      fact3: "The average website visitor decides in 5 seconds if a company is relevant.",
      fact4: "Only 22% of companies are satisfied with their positioning.",
      // Elapsed
      elapsed: "{seconds}s elapsed",
      // Estimated
      estimatedRemaining: "About {seconds} seconds left",
    };
    let result = translations[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(`{${k}}`, String(v));
      }
    }
    return result;
  },
}));

describe("LoadingState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Email form tests (existing) ---

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

  // --- Step counter ---

  it("shows step counter with correct step for each stage", () => {
    const { rerender } = render(<LoadingState stage="scraping" />);
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();

    rerender(<LoadingState stage="analyzing" />);
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();

    rerender(<LoadingState stage="generating" />);
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
  });

  // --- Rotating sub-messages ---

  it("shows rotating sub-messages that change over time", () => {
    render(<LoadingState stage="scraping" />);

    // First sub-message visible initially
    expect(screen.getByText("Knocking on the front door...")).toBeInTheDocument();

    // After 4 seconds, should rotate to next sub-message
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText("Reading between the lines...")).toBeInTheDocument();

    // After another 4 seconds, rotate again
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText("Decoding the messaging DNA...")).toBeInTheDocument();
  });

  // --- Progress bar ---

  it("renders a progress bar", () => {
    render(<LoadingState stage="scraping" />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
  });

  // --- Elapsed time counter ---

  it("shows elapsed time that increments", () => {
    render(<LoadingState stage="scraping" />);

    expect(screen.getByText("0s elapsed")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("5s elapsed")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText("15s elapsed")).toBeInTheDocument();
  });

  // --- Estimated time remaining ---

  it("shows estimated time remaining", () => {
    render(<LoadingState stage="scraping" />);

    // Initial: ~90s remaining (estimate based on 90s total)
    expect(screen.getByText("About 90 seconds left")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText("About 80 seconds left")).toBeInTheDocument();
  });

  // --- Did you know facts ---

  it("shows a 'did you know' fact that rotates", () => {
    render(<LoadingState stage="scraping" />);

    // Should show one of the facts (rendered with 💡 prefix)
    const factTexts = [
      "83% of B2B buyers say positioning clarity directly affects their purchase decision.",
      "Companies with clear positioning grow 2x faster than competitors.",
      "The average website visitor decides in 5 seconds if a company is relevant.",
      "Only 22% of companies are satisfied with their positioning.",
    ];

    const foundFact = factTexts.some((text) =>
      screen.queryByText((content) => content.includes(text)) !== null
    );
    expect(foundFact).toBe(true);
  });

  // --- Updated patience text ---

  it("shows updated patience text with 1-2 minutes", () => {
    render(<LoadingState stage="scraping" />);

    expect(screen.getByText("This takes about 1–2 minutes")).toBeInTheDocument();
  });
});
