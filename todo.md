# Positioning Radar — Todo List

## ✅ Completed

### V1 — Core Analysis Engine
- ✅ Types: FiveSecondTest, PositioningHealth, RedFlagDetail interfaces
- ✅ Prompt: 4 analyses (positioning map, 5-second test, health score, red flags)
- ✅ Analyzer: max_tokens 8192, recommendations mapping
- ✅ Components: FiveSecondTest, PositioningHealthScore, PositioningHealthDetail, RedFlags, EmailGate
- ✅ Email gating: free vs. gated content split
- ✅ i18n: en.json + fi.json with all new keys
- ✅ Results page integration with backward compatibility

### V3 — Positioning Score Hero + Gating Redesign
- ✅ `PositioningScoreGauge` component (SVG arc, PageSpeed-style, 0-100, color-coded)
- ✅ V3 results page at `/results/[id]` (now default route)
- ✅ User-focused free content: gauge, 5-sec test, health detail, red flags, recommendations
- ✅ Competitor content gated: map, insights, differentiation scores
- ✅ V2 moved to `/results-v2/[id]` (classic layout preserved)
- ✅ All i18n keys (en + fi) in `v3` namespace

### Email During Loading
- ✅ Email form in LoadingState (appears after 15s delay)
- ✅ Calls `/api/subscribe` with `source: "loading_email_results"`
- ✅ After analysis completes, sends results email with link via Resend
- ✅ Smooth fade-in, non-blocking UX

### Email Delivery (Resend)
- ✅ `src/lib/email.ts` — sendResultsEmail + sendLeadConfirmationEmail
- ✅ HTML email templates with locale support (en/fi)
- ✅ Wired into `/api/subscribe` route (results email when analysis_id present, confirmation when null)
- ✅ Schema fix: `analysis_id` nullable for loading emails

### 6-Element Breakdown Cards
- ✅ PositioningHealthDetail rewritten: single card → responsive grid of 6 individual cards
- ✅ Each card: score, color-coded ring, progress bar, summary
- ✅ Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### Reports Section (Brand Showcases)
- ✅ `src/lib/reports-data.ts` — static data for 3 industries (CRM, Design, E-commerce, 9 companies)
- ✅ Reports index page `/reports/` with card grid
- ✅ Report detail page `/reports/[slug]/` with full analysis (no gating)
- ✅ Reports section on frontpage (below recent analyses)
- ✅ All i18n keys (en + fi) in `reports` namespace

### Loading UX
- ✅ 3 loading stages with rotating witty sub-messages
- ✅ Step counter ("Step 1 of 3"), progress bar
- ✅ Elapsed timer + estimated time remaining
- ✅ Rotating fun facts about positioning

### Admin Dashboard
- ✅ Admin dashboard at `/admin` with token auth (ADMIN_SECRET)
- ✅ Stats overview: total analyses, leads, weekly/monthly counts, industry breakdown
- ✅ Analyses table, Leads table — filterable, paginated, CSV export
- ✅ Cost estimator (Firecrawl + Claude + Tavily per analysis)

### Competitor Detection Improvements
- ✅ Claude-first competitor detection (1 API call instead of 3 for known companies)
- ✅ Parallel background scrape for cache warming (used later in positioning analysis)
- ✅ Fallback to scrape+Tavily for unknown/new companies (confidence-based)
- ✅ Market selector dropdown (Finland, Global, US, EU, Nordics, Custom)
- ✅ Market parameter flows through API → competitor-finder → Claude prompt

### Bug Fixes
- ✅ Competitor discovery: rasol.fi returning "Web development" → fixed
- ✅ ANTHROPIC_API_KEY env var conflict → POSITIONING_RADAR_ANTHROPIC_KEY fallback
- ✅ Lazy Anthropic client initialization

### Infrastructure
- ✅ positionti.fi domain linked to Vercel (DNS records needed at registrar)
- ✅ Privacy page + footer links
- ✅ PDF report generation
- ✅ Rate limiting (sliding window, in-memory)
- ✅ User analysis history (localStorage)
- ✅ Frontpage copies aligned with MEOM's 6-element positioning model

## 📋 TODO

### Production & Launch
- [ ] Add `RESEND_API_KEY` to Vercel env vars
- [ ] Configure DNS for positionti.fi (A record → 76.76.21.21)
- [ ] Verify email sending works end-to-end in production

### HubSpot Integration
- [ ] Add `HUBSPOT_API_KEY` env var
- [ ] Map lead fields to HubSpot contact properties (email, source, analysis URL)
- [ ] Custom HubSpot property: `positioning_radar_analysis_url`
- [ ] Batch sync endpoint: `/api/admin/hubspot-sync`
- [ ] Wire up "Sync to HubSpot" button in admin dashboard

### Ideas / Experiments
- [ ] **AI API cost optimization**: Prompt compression, model downgrade for simpler tasks (Haiku for competitor discovery?), response caching, batching, token budget limits
- [ ] **"Seuranta"**: Ilmoitus kun kilpailijan positiointi muuttuu
- [ ] **A/B test V2 vs V3**: Compare email capture rates between classic and gauge layouts

## 🔗 Key Files

### Routes
- `src/app/[locale]/page.tsx` — Homepage (form, loading, history, reports section)
- `src/app/[locale]/results/[id]/page.tsx` — V3 results (default, gauge hero)
- `src/app/[locale]/results-v2/[id]/page.tsx` — V2 results (classic layout)
- `src/app/[locale]/reports/page.tsx` — Reports index
- `src/app/[locale]/reports/[slug]/page.tsx` — Report detail page
- `src/app/admin/page.tsx` — Admin dashboard
- `src/app/[locale]/privacy/page.tsx` — Privacy policy

### Core Logic
- `src/lib/competitor-finder.ts` — Competitor discovery (scrape → Claude → Tavily → Claude)
- `src/lib/analyzer.ts` — Positioning analysis (Claude, 8192 tokens)
- `src/prompts/positioning-analysis.ts` — 4-analysis prompt
- `src/lib/types.ts` — All type definitions
- `src/lib/reports-data.ts` — Static report data (3 industries, 9 companies)
- `src/lib/email.ts` — Email sending via Resend
- `src/lib/pdf-report.ts` — PDF generation

### Components
- `src/components/PositioningScoreGauge.tsx` — SVG arc gauge (0-100)
- `src/components/PositioningMap.tsx` — X/Y positioning map
- `src/components/PositioningHealthDetail.tsx` — 6-element breakdown cards
- `src/components/FiveSecondTest.tsx` — 5-second test results
- `src/components/RedFlags.tsx` — Positioning red flags
- `src/components/InsightCards.tsx` — Key observations
- `src/components/DifferentiationScore.tsx` — Company differentiation scores
- `src/components/EmailGate.tsx` — Email capture gate
- `src/components/LoadingState.tsx` — Loading with stages, email capture
- `src/components/UrlInput.tsx` — URL input form with competitor discovery

### Tests (182 passing)
- `src/components/__tests__/` — Component tests
- `src/app/[locale]/results/__tests__/` — V3 results page tests
- `src/app/[locale]/results-v2/__tests__/` — V2 results page tests
- `src/app/[locale]/reports/__tests__/` — Reports page tests
- `src/app/api/__tests__/` — API route tests
- `src/lib/__tests__/` — Library tests

## 📊 Database
- **`analyses`**: id, user_url, competitor_urls[], industry, locale, result (JSONB)
- **`leads`**: id, email, analysis_id (FK), source
