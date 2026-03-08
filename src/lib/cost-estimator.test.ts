import { describe, it, expect } from "vitest";
import { calculateCostEstimates } from "./cost-estimator";

describe("calculateCostEstimates", () => {
  it("returns zero costs when there are no analyses", () => {
    const result = calculateCostEstimates({
      totalAnalyses: 0,
      analysesThisWeek: 0,
      analysesThisMonth: 0,
    });

    expect(result.estimatedTotalCost).toBe(0);
    expect(result.estimatedWeekCost).toBe(0);
    expect(result.estimatedMonthCost).toBe(0);
    expect(result.estimatedCostPerAnalysis).toBe(0);
  });

  it("calculates estimated cost per analysis based on API pricing", () => {
    const result = calculateCostEstimates({
      totalAnalyses: 1,
      analysesThisWeek: 0,
      analysesThisMonth: 0,
    });

    // 4 × $0.02 (firecrawl) + 2 × $0.08 (claude) + 0.5 × $0.01 (tavily) = $0.245
    expect(result.estimatedCostPerAnalysis).toBeCloseTo(0.245, 3);
    expect(result.estimatedTotalCost).toBeCloseTo(0.245, 3);
  });

  it("scales costs linearly with analysis counts", () => {
    const result = calculateCostEstimates({
      totalAnalyses: 100,
      analysesThisWeek: 10,
      analysesThisMonth: 40,
    });

    expect(result.estimatedTotalCost).toBeCloseTo(100 * 0.245, 1);
    expect(result.estimatedWeekCost).toBeCloseTo(10 * 0.245, 1);
    expect(result.estimatedMonthCost).toBeCloseTo(40 * 0.245, 1);
  });

  it("provides per-analysis cost breakdown by service", () => {
    const result = calculateCostEstimates({
      totalAnalyses: 1,
      analysesThisWeek: 0,
      analysesThisMonth: 0,
    });

    expect(result.costBreakdown.firecrawlPerAnalysis).toBeCloseTo(0.08, 3);
    expect(result.costBreakdown.claudePerAnalysis).toBeCloseTo(0.16, 3);
    expect(result.costBreakdown.tavilyPerAnalysis).toBeCloseTo(0.005, 3);
  });
});
