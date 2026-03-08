import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { findCompetitors } from "@/lib/competitor-finder";
import { competitorLimiter, applyRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  url: z.url(),
  locale: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(competitorLimiter, request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    console.log("[API_COMPETITORS] POST:", body.url);

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      console.log("[API_COMPETITORS] Validation failed");
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    console.log("[API_COMPETITORS] Finding competitors for:", parsed.data.url);
    const result = await findCompetitors(
      parsed.data.url,
      parsed.data.locale || "en"
    );

    console.log("[API_COMPETITORS] Successfully returned", result.competitors.length, "competitors");
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API_COMPETITORS] Error:", error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        error: "Failed to find competitors",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
