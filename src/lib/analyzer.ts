import Anthropic from "@anthropic-ai/sdk";
import { buildPositioningPrompt } from "@/prompts/positioning-analysis";
import { PositioningResult, ScrapedPage } from "./types";
import { nanoid } from "nanoid";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY?.trim(),
});

export async function analyzePositioning(
  pages: ScrapedPage[],
  userUrl: string,
  industry?: string,
  locale: string = "en"
): Promise<PositioningResult> {
  const companies = pages.map((page) => ({
    url: page.url,
    content: [
      page.title ? `# ${page.title}` : "",
      page.meta_description ? `> ${page.meta_description}` : "",
      page.content,
    ]
      .filter(Boolean)
      .join("\n\n"),
  }));

  const prompt = buildPositioningPrompt(companies, userUrl, industry, locale);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Extract JSON from response (handle potential markdown code blocks)
  let jsonStr = textBlock.text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const analysis = JSON.parse(jsonStr);

  return {
    id: nanoid(12),
    created_at: new Date().toISOString(),
    industry_context: analysis.industry_context,
    axes: analysis.axes,
    companies: analysis.companies,
    insights: analysis.insights,
    recommendations: analysis.recommendations || [],
    user_company_url: userUrl,
  };
}
