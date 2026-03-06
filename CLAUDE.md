# Positioning Radar

Website positioning analysis tool. Analyzes company websites against competitors and generates a positioning map with insights.

## Architecture
- Next.js 16 App Router, TypeScript, Tailwind CSS
- Firecrawl API for website scraping
- Claude API (Anthropic SDK) for positioning analysis
- Recharts for positioning map visualization
- Supabase for results storage and lead capture
- next-intl for i18n (English + Finnish)

## Key flows
1. User enters own URL + 2-5 competitor URLs + optional industry
2. Backend scrapes homepages via Firecrawl
3. Claude analyzes positioning, picks axes, scores companies
4. Frontend renders interactive positioning map + insights
5. Results saved to Supabase, shareable via `/results/[id]`
6. Full report gated behind email (lead capture)

## Critical files
- `src/prompts/positioning-analysis.ts` — core analysis prompt
- `src/lib/analyzer.ts` — Claude API integration
- `src/lib/scraper.ts` — Firecrawl wrapper
- `src/components/PositioningMap.tsx` — scatter chart visualization
- `src/app/[locale]/page.tsx` — main page (input + results)

## API routes
- `POST /api/analyze` — run full analysis (scrape + analyze + save)
- `GET /api/results/[id]` — fetch saved analysis
- `POST /api/subscribe` — save lead email for gated content

## Environment variables
See `.env.local.example` for required keys.

## i18n
- English (default) + Finnish
- Messages in `messages/en.json` and `messages/fi.json`
- Locale routing via `[locale]` segment

## Plan document
Full project plan: MEOM Cowork → markkinointi/lead-magnet-positiointi/plan.md
