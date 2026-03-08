import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { validateAdminRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = validateAdminRequest(request);
  if (authError) return authError;

  const supabase = createServerClient();
  const url = new URL(request.url);

  const industry = url.searchParams.get("industry");
  const locale = url.searchParams.get("locale");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const limit = parseInt(url.searchParams.get("limit") || "100");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let query = supabase
    .from("analyses")
    .select("id, created_at, user_url, competitor_urls, industry, locale, leads(email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (industry) query = query.eq("industry", industry);
  if (locale) query = query.eq("locale", locale);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count });
}
