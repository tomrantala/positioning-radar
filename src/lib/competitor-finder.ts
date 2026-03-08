import { tavily } from "@tavily/core";
import Anthropic from "@anthropic-ai/sdk";
import { competitorCache } from "./cache";

export interface CompetitorSuggestion {
  name: string;
  url: string;
  description: string;
}

export interface CompetitorFinderResult {
  detected_industry: string;
  company_name: string;
  competitors: CompetitorSuggestion[];
}

function getAnthropicClient() {
  const apiKey = (process.env.POSITIONING_RADAR_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY)?.trim();
  if (!apiKey) {
    throw new Error("POSITIONING_RADAR_ANTHROPIC_KEY (or ANTHROPIC_API_KEY) is not set");
  }
  return new Anthropic({ apiKey });
}

export async function findCompetitors(
  userUrl: string,
  locale: string = "en"
): Promise<CompetitorFinderResult> {
  // Check cache first (key by URL + locale)
  const cacheKey = `${userUrl}::${locale}`;
  const cached = competitorCache.get(cacheKey) as CompetitorFinderResult | undefined;
  if (cached) {
    console.log("[COMPETITOR_FINDER] Cache hit:", userUrl);
    return cached;
  }

  console.log("[COMPETITOR_FINDER] Starting for:", userUrl);

  // Step 1: Scrape the user's homepage to understand what they do
  const { scrapePage } = await import("./scraper");
  const userPage = await scrapePage(userUrl);

  console.log("[SCRAPER] Title:", userPage.title, "| Content:", userPage.content.length, "chars");

  // Step 2: Ask Claude to identify the company, industry, and search query
  const anthropic = getAnthropicClient();
  const identifyResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert at identifying company industries from website content. Your analysis must be ACCURATE.

Carefully analyze this website content and extract:
1. Company name — exactly as shown on the website
2. Industry/market they operate in — identify the ACTUAL business type, NOT assumptions based on web technology
3. A search query to find their direct competitors

CRITICAL INSTRUCTIONS:
- Do NOT default to "web development" or "digital services" just because you see web-related terms
- Look at the main value proposition, products/services offered, target customers
- The industry must match what the company ACTUALLY DOES, not what tools they use
- For pages in Finnish or other languages, read carefully to understand the business
- Search query should target companies in the SAME industry, not web developers unless that's the actual business

Website: ${userUrl}
Title: ${userPage.title}
Meta Description: ${userPage.meta_description}

Content (first 5000 characters):
${userPage.content.slice(0, 5000)}

Respond in JSON only:
{
  "company_name": "string",
  "industry": "string — the actual industry they operate in",
  "search_query": "string — a search query like 'top [industry] companies in [country/market]' that would find direct competitors",
  "country": "string — the country/market based on the website language and content"
}`,
      },
    ],
  });

  const textBlock = identifyResponse.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Failed to identify company");
  }

  let identifyJson = textBlock.text.trim();
  const jsonMatch = identifyJson.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) identifyJson = jsonMatch[1].trim();
  const identified = JSON.parse(identifyJson);

  console.log("[CLAUDE_IDENTIFY]", identified.company_name, "|", identified.industry, "|", identified.country);

  // Step 3: Search for competitors using Tavily
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY?.trim() || "" });

  console.log("[TAVILY] Searching:", identified.search_query);
  const searchResult = await tvly.search(identified.search_query, {
    maxResults: 10,
    searchDepth: "advanced",
    includeAnswer: false,
  });

  console.log("[TAVILY]", searchResult.results.length, "results found");

  // Step 4: Ask Claude to filter and rank the best competitors
  const lang = locale === "fi" ? "Finnish" : "English";
  const filterResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You identified this company:
- Name: ${identified.company_name}
- URL: ${userUrl}
- Industry: ${identified.industry}
- Country/market: ${identified.country}

Here are search results for their competitors:
${searchResult.results
  .map(
    (r, i) => `${i + 1}. ${r.title} — ${r.url}
   ${r.content?.slice(0, 200) || ""}`
  )
  .join("\n\n")}

Select the 5 best DIRECT competitors. Rules:
- Must be different companies (not the user's own company at ${userUrl})
- Must offer similar services/products
- Must target similar customers
- Prefer companies in the same country/market
- Exclude directories, review sites, news articles — only actual company websites

Respond in ${lang}. Return JSON only:
{
  "competitors": [
    { "name": "Company Name", "url": "https://...", "description": "Brief description of what they do" }
  ]
}`,
      },
    ],
  });

  const filterBlock = filterResponse.content.find((b) => b.type === "text");
  if (!filterBlock || filterBlock.type !== "text") {
    throw new Error("Failed to filter competitors");
  }

  let filterJson = filterBlock.text.trim();
  const filterMatch = filterJson.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (filterMatch) filterJson = filterMatch[1].trim();
  const filtered = JSON.parse(filterJson);

  console.log("[CLAUDE_FILTER]", filtered.competitors.slice(0, 5).map((c: CompetitorSuggestion) => c.name).join(", "));

  const result: CompetitorFinderResult = {
    detected_industry: identified.industry,
    company_name: identified.company_name,
    competitors: filtered.competitors.slice(0, 5),
  };

  // Cache the result
  competitorCache.set(cacheKey, result);

  return result;
}
