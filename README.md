# Positioning Radar

Score your website's positioning across 6 key elements. See where you stand and where there's room to differentiate.

**Live:** [positionti.fi](https://positionti.fi) / [positioning-radar.vercel.app](https://positioning-radar.vercel.app)

## What it does

1. Enter your website URL + competitors (or let AI find them)
2. AI scrapes and analyzes positioning using MEOM's 6-element model
3. Get a Positioning Score (0-100), positioning map, 5-second test, red flags, and recommendations
4. Unlock competitor comparison by entering your email

## Tech stack

- **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **AI:** Claude API (Anthropic SDK) for positioning analysis
- **Scraping:** Firecrawl API
- **Database:** Supabase (analyses + leads)
- **Email:** Resend (transactional emails)
- **i18n:** next-intl (English + Finnish)
- **Charts:** Recharts (positioning map)
- **Hosting:** Vercel

## Getting started

```bash
npm install
cp .env.local.example .env.local  # fill in API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|----------|-------------|
| `POSITIONING_RADAR_ANTHROPIC_KEY` | Claude API key |
| `FIRECRAWL_API_KEY` | Firecrawl web scraping |
| `RESEND_API_KEY` | Resend transactional emails |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `ADMIN_SECRET` | Admin dashboard auth token |
| `TAVILY_API_KEY` | Tavily search (competitor discovery) |

## Testing

```bash
npx vitest run
```

182 tests across 28 test files. All features built with TDD.

## Project structure

```
src/
  app/
    [locale]/
      page.tsx              # Homepage (form, loading, reports)
      results/[id]/         # V3 results (gauge hero, competitor gating)
      results-v2/[id]/      # V2 results (classic layout)
      reports/              # Brand showcase reports
      privacy/              # Privacy policy
    admin/                  # Admin dashboard
    api/
      analyze/              # POST: run analysis
      results/[id]/         # GET: fetch results
      subscribe/            # POST: email capture
      admin/                # Admin API routes
  components/               # UI components
  lib/                      # Core logic (analyzer, scraper, email, types)
  prompts/                  # Claude prompts
messages/
  en.json                   # English translations
  fi.json                   # Finnish translations
```

## Built by

[MEOM](https://meom.fi) — AI-powered positioning analysis.
