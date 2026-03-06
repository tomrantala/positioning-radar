import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { findCompetitors } from "@/lib/competitor-finder";

const schema = z.object({
  url: z.url(),
  locale: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await findCompetitors(
      parsed.data.url,
      parsed.data.locale || "en"
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Competitor search error:", error);
    return NextResponse.json(
      {
        error: "Failed to find competitors",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
