export interface CostEstimateInput {
  totalAnalyses: number;
  analysesThisWeek: number;
  analysesThisMonth: number;
}

export interface CostEstimate {
  estimatedTotalCost: number;
  estimatedWeekCost: number;
  estimatedMonthCost: number;
  estimatedCostPerAnalysis: number;
  costBreakdown: {
    firecrawlPerAnalysis: number;
    claudePerAnalysis: number;
    tavilyPerAnalysis: number;
  };
}

// Average API calls per analysis (mix of auto + manual competitor discovery)
const AVG_FIRECRAWL_CALLS = 4;
const AVG_CLAUDE_CALLS = 2;
const AVG_TAVILY_CALLS = 0.5;

// Cost per API call (USD)
const FIRECRAWL_COST_PER_CALL = 0.02;
const CLAUDE_COST_PER_CALL = 0.08;
const TAVILY_COST_PER_CALL = 0.01;

export function calculateCostEstimates(
  input: CostEstimateInput
): CostEstimate {
  const firecrawlPerAnalysis = AVG_FIRECRAWL_CALLS * FIRECRAWL_COST_PER_CALL;
  const claudePerAnalysis = AVG_CLAUDE_CALLS * CLAUDE_COST_PER_CALL;
  const tavilyPerAnalysis = AVG_TAVILY_CALLS * TAVILY_COST_PER_CALL;
  const costPerAnalysis = firecrawlPerAnalysis + claudePerAnalysis + tavilyPerAnalysis;

  return {
    estimatedTotalCost: input.totalAnalyses * costPerAnalysis,
    estimatedWeekCost: input.analysesThisWeek * costPerAnalysis,
    estimatedMonthCost: input.analysesThisMonth * costPerAnalysis,
    estimatedCostPerAnalysis: input.totalAnalyses > 0 ? costPerAnalysis : 0,
    costBreakdown: {
      firecrawlPerAnalysis,
      claudePerAnalysis,
      tavilyPerAnalysis,
    },
  };
}
