import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { scrapePages } from "@/lib/scraper";
import { analyzePositioning } from "@/lib/analyzer";
import { createServerClient } from "@/lib/supabase";

const analyzeSchema = z.object({
  user_url: z.url(),
  competitor_urls: z.array(z.url()).min(2).max(5),
  industry: z.string().optional(),
  locale: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { user_url, competitor_urls, industry, locale } = parsed.data;
    const allUrls = [user_url, ...competitor_urls];

    // Scrape all pages
    const pages = await scrapePages(allUrls);

    // Analyze positioning
    const result = await analyzePositioning(
      pages,
      user_url,
      industry,
      locale
    );

    // Save to Supabase
    const supabase = createServerClient();
    const { error: dbError } = await supabase.from("analyses").insert({
      id: result.id,
      user_url,
      competitor_urls,
      industry: industry || null,
      locale: locale || "en",
      result: {
        industry_context: result.industry_context,
        axes: result.axes,
        companies: result.companies,
        insights: result.insights,
      },
    });

    if (dbError) {
      console.error("Failed to save analysis:", dbError);
      // Don't fail the request — still return the result
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
