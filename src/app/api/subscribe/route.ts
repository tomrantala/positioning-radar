import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { createServerClient } from "@/lib/supabase";
import { subscribeLimiter, applyRateLimit } from "@/lib/rate-limit";
import { sendResultsEmail, sendLeadConfirmationEmail } from "@/lib/email";

const subscribeSchema = z.object({
  email: z.email(),
  analysis_id: z.string().nullable().optional(),
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
      analysis_id: analysis_id ?? null,
      source: source || "full_report",
    });

    if (error) {
      console.error("Failed to save lead:", error);
      return NextResponse.json(
        { error: "Failed to subscribe" },
        { status: 500 }
      );
    }

    // Send email (non-blocking — don't wait for email delivery)
    if (analysis_id) {
      // Has analysis_id → send results link
      sendResultsEmail({ to: email, analysisId: analysis_id }).catch(() => {});
    } else {
      // No analysis_id (loading email) → send confirmation
      sendLeadConfirmationEmail({ to: email }).catch(() => {});
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
