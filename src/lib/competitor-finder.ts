import { tavily } from "@tavily/core";
import Anthropic from "@anthropic-ai/sdk";

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

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY?.trim(),
});

export async function findCompetitors(
  userUrl: string,
  locale: string = "en"
): Promise<CompetitorFinderResult> {
  // Step 1: Scrape the user's homepage to understand what they do
  const { scrapePage } = await import("./scraper");
  const userPage = await scrapePage(userUrl);

  // Step 2: Ask Claude to identify the company, industry, and search query
  const identifyResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this website content and extract:
1. Company name
2. Industry/market they operate in
3. A search query to find their direct competitors (companies offering similar services/products to similar customers)

Website: ${userUrl}
Content:
${userPage.content.slice(0, 3000)}

Respond in JSON only:
{
  "company_name": "string",
  "industry": "string",
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

  // Step 3: Search for competitors using Tavily
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY?.trim() || "" });

  const searchResult = await tvly.search(identified.search_query, {
    maxResults: 10,
    searchDepth: "advanced",
    includeAnswer: false,
  });

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

  return {
    detected_industry: identified.industry,
    company_name: identified.company_name,
    competitors: filtered.competitors.slice(0, 5),
  };
}
