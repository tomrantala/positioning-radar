export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string;
          created_at: string;
          user_url: string;
          competitor_urls: string[];
          industry: string | null;
          locale: string;
          result: AnalysisResultJson;
        };
        Insert: {
          id: string;
          user_url: string;
          competitor_urls: string[];
          industry?: string | null;
          locale?: string;
          result: AnalysisResultJson;
        };
        Update: Partial<{
          id: string;
          user_url: string;
          competitor_urls: string[];
          industry: string | null;
          locale: string;
          result: AnalysisResultJson;
        }>;
      };
      leads: {
        Row: {
          id: number;
          created_at: string;
          email: string;
          analysis_id: string;
          source: string;
        };
        Insert: {
          email: string;
          analysis_id: string;
          source?: string;
        };
        Update: Partial<{
          email: string;
          analysis_id: string;
          source: string;
        }>;
      };
    };
  };
}

interface AnalysisResultJson {
  industry_context: string;
  axes: {
    x: { label: string; low_label: string; high_label: string };
    y: { label: string; low_label: string; high_label: string };
  };
  companies: Array<{
    name: string;
    url: string;
    x_score: number;
    y_score: number;
    key_messages: string[];
    target_audience: string;
    differentiation_summary: string;
    differentiation_index: number;
  }>;
  insights: string[];
  recommendations: string[];
}
