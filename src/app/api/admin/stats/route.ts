import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { validateAdminRequest } from "@/lib/admin-auth";
import { calculateCostEstimates } from "@/lib/cost-estimator";

export async function GET(request: NextRequest) {
  const authError = validateAdminRequest(request);
  if (authError) return authError;

  const supabase = createServerClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalAnalyses,
    totalLeads,
    weekAnalyses,
    monthAnalyses,
    weekLeads,
    industriesData,
    localesData,
  ] = await Promise.all([
    supabase.from("analyses").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("analyses").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("analyses").select("id", { count: "exact", head: true }).gte("created_at", monthAgo),
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("analyses").select("industry").not("industry", "is", null),
    supabase.from("analyses").select("locale"),
  ]);

  const industries: Record<string, number> = {};
  (industriesData.data || []).forEach((row: { industry: string }) => {
    industries[row.industry] = (industries[row.industry] || 0) + 1;
  });

  const locales: Record<string, number> = {};
  (localesData.data || []).forEach((row: { locale: string }) => {
    locales[row.locale] = (locales[row.locale] || 0) + 1;
  });

  const costEstimates = calculateCostEstimates({
    totalAnalyses: totalAnalyses.count || 0,
    analysesThisWeek: weekAnalyses.count || 0,
    analysesThisMonth: monthAnalyses.count || 0,
  });

  return NextResponse.json({
    total_analyses: totalAnalyses.count || 0,
    total_leads: totalLeads.count || 0,
    analyses_this_week: weekAnalyses.count || 0,
    analyses_this_month: monthAnalyses.count || 0,
    leads_this_week: weekLeads.count || 0,
    industries,
    locales,
    cost_estimates: costEstimates,
  });
}
