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

interface WebSearchResult {
  company_name: string;
  industry: string;
  country: string;
  competitors: CompetitorSuggestion[];
}

function getAnthropicClient() {
  const apiKey = (process.env.POSITIONING_RADAR_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY)?.trim();
  if (!apiKey) {
    throw new Error("POSITIONING_RADAR_ANTHROPIC_KEY (or ANTHROPIC_API_KEY) is not set");
  }
  return new Anthropic({ apiKey });
}

function parseJsonResponse(text: string): unknown {
  let json = text.trim();
  const jsonMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) json = jsonMatch[1].trim();
  return JSON.parse(json);
}

function getWebSearchTool(market?: string) {
  const tool: Record<string, unknown> = {
    type: "web_search_20250305",
    name: "web_search",
    max_uses: 5,
  };

  const marketLocations: Record<string, { country: string; city?: string; region?: string; timezone: string }> = {
    finland: { country: "FI", city: "Helsinki", timezone: "Europe/Helsinki" },
    us: { country: "US", timezone: "America/New_York" },
    europe: { country: "DE", timezone: "Europe/Berlin" },
    nordics: { country: "FI", timezone: "Europe/Helsinki" },
  };

  const normalized = market?.toLowerCase();
  if (normalized && marketLocations[normalized]) {
    tool.user_location = {
      type: "approximate",
      ...marketLocations[normalized],
    };
  }

  return tool;
}

/**
 * Competitor detection using Claude with web search tool.
 * Claude searches the web to find real competitors instead of guessing.
 * Scraped content gives Claude context about what the company actually does.
 */
async function askClaudeForCompetitors(
  userUrl: string,
  locale: string,
  market?: string,
  scrapedContent?: { title: string; meta_description: string; content: string }
): Promise<WebSearchResult> {
  const anthropic = getAnthropicClient();
  const lang = locale === "fi" ? "Finnish" : "English";

  const companyContext = scrapedContent
    ? `\n\nHere is what their website says:\nTitle: ${scrapedContent.title}\nDescription: ${scrapedContent.meta_description}\nContent: ${scrapedContent.content.slice(0, 3000)}`
    : "";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    tools: [getWebSearchTool(market)] as never[],
    messages: [
      {
        role: "user",
        content: `Find the direct competitors for this company: ${userUrl}
${market ? `Focus on the ${market} market.` : ""}${companyContext}

Instructions:
1. Read the company context above to understand what they do
2. Search the web for their competitors using specific queries:
   - "[company name] kilpailijat" or "[company name] competitors"
   - "[company name] vs" or "[company name] alternatives"
   - "[specific industry] companies [market]"
3. Return 5 direct competitors with verified website URLs

Rules:
- Only return competitors you found in web search results
- Competitors must be real companies offering similar services/products to the SAME target audience
${market ? `- Focus on competitors in the ${market} market` : "- Prefer same country/market competitors"}
- Include each competitor's actual website URL (not social media or directory pages)
- Respond in ${lang}

After searching, respond with JSON only:
{
  "company_name": "string",
  "industry": "string — the actual industry they operate in",
  "country": "string — the country/market",
  "competitors": [
    { "name": "Company Name", "url": "https://...", "description": "Brief description" }
  ]
}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Failed to identify company");
  }

  return parseJsonResponse(textBlock.text) as WebSearchResult;
}

/**
 * Fallback: legacy flow using scraped content + Tavily search.
 * Used when Claude-first returns low confidence.
 */
async function findCompetitorsFallback(
  userUrl: string,
  locale: string,
  market?: string
): Promise<CompetitorFinderResult> {
  const { scrapePage } = await import("./scraper");
  const userPage = await scrapePage(userUrl);

  console.log("[FALLBACK_SCRAPER] Title:", userPage.title, "| Content:", userPage.content.length, "chars");

  const anthropic = getAnthropicClient();

  // Step 1: Identify company from scraped content
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
${market ? `- Focus the search query on the ${market} market` : ""}

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

  const identified = parseJsonResponse(textBlock.text) as {
    company_name: string;
    industry: string;
    search_query: string;
    country: string;
  };

  console.log("[FALLBACK_IDENTIFY]", identified.company_name, "|", identified.industry, "|", identified.country);

  // Step 2: Search for competitors using Tavily
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY?.trim() || "" });

  console.log("[FALLBACK_TAVILY] Searching:", identified.search_query);
  const searchResult = await tvly.search(identified.search_query, {
    maxResults: 10,
    searchDepth: "advanced",
    includeAnswer: false,
  });

  console.log("[FALLBACK_TAVILY]", searchResult.results.length, "results found");

  // Step 3: Filter and rank competitors
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

  const filtered = parseJsonResponse(filterBlock.text) as {
    competitors: CompetitorSuggestion[];
  };

  console.log("[FALLBACK_FILTER]", filtered.competitors.slice(0, 5).map((c) => c.name).join(", "));

  return {
    detected_industry: identified.industry,
    company_name: identified.company_name,
    competitors: filtered.competitors.slice(0, 5),
  };
}

export async function findCompetitors(
  userUrl: string,
  locale: string = "en",
  market?: string
): Promise<CompetitorFinderResult> {
  // Check cache first (key by URL + locale + market)
  const cacheKey = `${userUrl}::${locale}::${market || ""}`;
  const cached = competitorCache.get(cacheKey) as CompetitorFinderResult | undefined;
  if (cached) {
    console.log("[COMPETITOR_FINDER] Cache hit:", userUrl);
    return cached;
  }

  console.log("[COMPETITOR_FINDER] Starting web search for:", userUrl, market ? `(market: ${market})` : "");

  try {
    // Scrape first to give Claude context about what the company does
    const { scrapePage } = await import("./scraper");
    const scraped = await scrapePage(userUrl).catch((err) => {
      console.log("[COMPETITOR_FINDER] Scrape failed (non-blocking):", err.message);
      return null;
    });

    const scrapedContent = scraped ? {
      title: scraped.title,
      meta_description: scraped.meta_description,
      content: scraped.content,
    } : undefined;

    const webResult = await askClaudeForCompetitors(userUrl, locale, market, scrapedContent);

    console.log("[COMPETITOR_FINDER] Web search result:", webResult.company_name, "|", webResult.industry);

    const result: CompetitorFinderResult = {
      detected_industry: webResult.industry,
      company_name: webResult.company_name,
      competitors: webResult.competitors.slice(0, 5),
    };

    competitorCache.set(cacheKey, result);
    return result;
  } catch (err) {
    // Web search failed: fall back to scrape + Tavily flow
    console.log("[COMPETITOR_FINDER] Web search failed, falling back to scrape+Tavily:", (err as Error).message);
    const result = await findCompetitorsFallback(userUrl, locale, market);
    competitorCache.set(cacheKey, result);
    return result;
  }
}
