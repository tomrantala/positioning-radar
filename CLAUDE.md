# Positioning Radar

Website positioning analysis tool. Analyzes company websites against competitors using MEOM's 6-element positioning model and generates a positioning map with insights.

## Workflow rules

### Always use TDD
All new features and bug fixes MUST follow test-driven development (red-green-refactor). Write one test first, make it pass, then iterate. Use vertical slices — never write all tests first. See `.claude/skills/tdd` for full TDD guidelines.

### Always maintain todo.md
Keep `todo.md` in the repo root up to date. When completing a task, mark it done. When adding new work, add it to the appropriate section. The todo is the single source of truth for project status.

## Architecture
- Next.js 16 App Router, TypeScript, Tailwind CSS
- Firecrawl API for website scraping
- Claude API (Anthropic SDK) for positioning analysis
- Recharts for positioning map visualization
- Supabase for results storage and lead capture
- Resend for transactional emails
- next-intl for i18n (English + Finnish)

## Key flows
1. User enters own URL + 2-5 competitor URLs + optional industry
2. Backend scrapes homepages via Firecrawl
3. Claude analyzes positioning (4 analyses: map, 5-sec test, health score, red flags)
4. Frontend renders positioning score gauge + map + insights
5. Results saved to Supabase, shareable via `/results/[id]`
6. Competitor content gated behind email (lead capture)

## Routes
- `/[locale]/` — Homepage (form, loading, history, reports)
- `/[locale]/results/[id]` — V3 results (default, gauge hero, competitor gating)
- `/[locale]/results-v2/[id]` — V2 results (classic layout, health detail gating)
- `/[locale]/reports/` — Reports index (brand showcases)
- `/[locale]/reports/[slug]` — Report detail (full analysis, no gating)
- `/[locale]/privacy` — Privacy policy
- `/admin` — Admin dashboard

## API routes
- `POST /api/analyze` — run full analysis (scrape + analyze + save)
- `GET /api/results/[id]` — fetch saved analysis
- `POST /api/subscribe` — save lead email + send email via Resend
- `GET /api/admin/*` — admin stats, analyses, leads, CSV export

## Critical files
- `src/prompts/positioning-analysis.ts` — core analysis prompt (6-element model)
- `src/lib/analyzer.ts` — Claude API integration
- `src/lib/scraper.ts` — Firecrawl wrapper
- `src/lib/reports-data.ts` — static report data (3 industries, 9 companies)
- `src/lib/email.ts` — Resend email sending
- `src/lib/types.ts` — all TypeScript types
- `src/components/PositioningScoreGauge.tsx` — SVG arc gauge (0-100)
- `src/components/PositioningMap.tsx` — scatter chart visualization

## Environment variables
See `.env.local.example` for required keys. Key vars:
- `POSITIONING_RADAR_ANTHROPIC_KEY` — Claude API
- `FIRECRAWL_API_KEY` — web scraping
- `RESEND_API_KEY` — transactional emails
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — database
- `ADMIN_SECRET` — admin dashboard auth

## i18n
- English (default) + Finnish
- Messages in `messages/en.json` and `messages/fi.json`
- Locale routing via `[locale]` segment

## Testing
- Framework: Vitest + @testing-library/react + jsdom
- Run: `npx vitest run`
- 182 tests across 28 test files
- 7 pre-existing failures in competitor-finder (missing API key in test env — not a real issue)

## Domain
- Production: positionti.fi (Vercel, DNS pending)
- Preview: positioning-radar.vercel.app

## Plan document
Full project plan: MEOM Cowork → markkinointi/lead-magnet-positiointi/plan.md
