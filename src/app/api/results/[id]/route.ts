import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Analysis not found" },
      { status: 404 }
    );
  }

  const result = data.result as Record<string, unknown>;

  return NextResponse.json({
    id: data.id,
    created_at: data.created_at,
    user_company_url: data.user_url,
    ...result,
  });
}
