export interface PositioningAxis {
  label: string;
  low_label: string;
  high_label: string;
}

// --- 5 Second Test ---

export interface FiveSecondTest {
  result: "pass" | "partial" | "fail";
  what_visitor_understands: string;
  what_is_unclear: string;
}

// --- Positioning Health (MEOM 6 Elements) ---

export interface HealthElement {
  score: number; // 0-100
  summary: string;
}

export interface PositioningHealth {
  total_score: number; // 0-100, average of 6 elements
  best_customers: HealthElement;
  competitive_alternatives: HealthElement;
  unique_attributes: HealthElement;
  value_creators: HealthElement;
  category: HealthElement;
  unique_value_propositions: HealthElement;
}

// --- Red Flags ---

export type RedFlagType =
  | "generic_terminology"
  | "self_focused_language"
  | "missing_pain_points"
  | "buzzword_overload"
  | "interchangeable_messaging";

export interface RedFlagDetail {
  type: RedFlagType;
  example: string; // concrete example from the website
  suggestion: string; // how to fix it
}

// --- Company Analysis ---

export interface CompanyAnalysis {
  name: string;
  url: string;
  x_score: number; // -100 to 100
  y_score: number; // -100 to 100
  key_messages: string[];
  target_audience: string;
  differentiation_summary: string;
  differentiation_index: number; // 0-100
  // v2: new analysis dimensions (optional for backward compat)
  five_second_test?: FiveSecondTest;
  positioning_health?: PositioningHealth;
  red_flags?: RedFlagType[];
  red_flag_details?: RedFlagDetail[];
}

// --- Full Result ---

export interface PositioningResult {
  id: string;
  created_at: string;
  industry_context: string;
  axes: { x: PositioningAxis; y: PositioningAxis };
  companies: CompanyAnalysis[];
  insights: string[];
  recommendations?: string[]; // v2: actionable suggestions (gated)
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
