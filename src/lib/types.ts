export interface PositioningAxis {
  label: string;
  low_label: string;
  high_label: string;
}

export interface CompanyAnalysis {
  name: string;
  url: string;
  x_score: number; // -100 to 100
  y_score: number; // -100 to 100
  key_messages: string[];
  target_audience: string;
  differentiation_summary: string;
  differentiation_index: number; // 0-100
}

export interface PositioningResult {
  id: string;
  created_at: string;
  industry_context: string;
  axes: { x: PositioningAxis; y: PositioningAxis };
  companies: CompanyAnalysis[];
  insights: string[];
  user_company_url: string;
}

export interface AnalyzeRequest {
  user_url: string;
  competitor_urls: string[];
  industry?: string;
  locale?: string;
}

export interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  meta_description?: string;
}

export interface AnalysisProgress {
  stage: "scraping" | "analyzing" | "generating";
  current: number;
  total: number;
  message: string;
}
