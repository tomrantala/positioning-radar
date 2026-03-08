import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { createServerClient } from "@/lib/supabase";
import { subscribeLimiter, applyRateLimit } from "@/lib/rate-limit";

const subscribeSchema = z.object({
  email: z.email(),
  analysis_id: z.string(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(subscribeLimiter, request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, analysis_id, source } = parsed.data;

    const supabase = createServerClient();
    const { error } = await supabase.from("leads").insert({
      email,
      analysis_id,
      source: source || "full_report",
    });

    if (error) {
      console.error("Failed to save lead:", error);
      return NextResponse.json(
        { error: "Failed to subscribe" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
