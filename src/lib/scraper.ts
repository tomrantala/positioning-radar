import { ScrapedPage } from "./types";
import { scrapeCache } from "./cache";
import { stripImages } from "./strip-images";

const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape";

export async function scrapePage(url: string): Promise<ScrapedPage> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not set");
  }

  // Normalize URL
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith("http")) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  // Check cache first
  const cached = scrapeCache.get(normalizedUrl) as ScrapedPage | undefined;
  if (cached) {
    console.log("[SCRAPER] Cache hit:", normalizedUrl);
    return cached;
  }

  const response = await fetch(FIRECRAWL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url: normalizedUrl,
      formats: ["markdown"],
      onlyMainContent: true,
      waitFor: 3000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to scrape ${normalizedUrl}: ${error}`);
  }

  const data = await response.json();
  const result = data.data;

  const page: ScrapedPage = {
    url: normalizedUrl,
    title: result?.metadata?.title || "",
    content: stripImages(result?.markdown || ""),
    meta_description: result?.metadata?.description || "",
  };

  // Cache the result
  scrapeCache.set(normalizedUrl, page);

  return page;
}

export async function scrapePages(
  urls: string[],
  onProgress?: (current: number, total: number) => void
): Promise<ScrapedPage[]> {
  const results: ScrapedPage[] = [];

  for (let i = 0; i < urls.length; i++) {
    onProgress?.(i + 1, urls.length);
    try {
      const page = await scrapePage(urls[i]);
      results.push(page);
    } catch (error) {
      console.error(`Failed to scrape ${urls[i]}:`, error);
      results.push({
        url: urls[i],
        title: "",
        content: `[Failed to scrape this URL: ${error instanceof Error ? error.message : "Unknown error"}]`,
        meta_description: "",
      });
    }
  }

  return results;
}
