# Positioning Radar — Todo List

## ✅ Completed

### V2 — 6-Element Framework Integration
- ✅ Types: FiveSecondTest, PositioningHealth, RedFlagDetail interfaces
- ✅ Prompt: 4 analyses (positioning map, 5-second test, health score, red flags)
- ✅ Analyzer: max_tokens 8192, recommendations mapping
- ✅ Components: FiveSecondTest, PositioningHealthScore, PositioningHealthDetail, RedFlags, EmailGate
- ✅ Email gating: free vs. gated content split
- ✅ i18n: en.json + fi.json with all new keys
- ✅ Results page integration with backward compatibility

### Bug Fixes
- ✅ Competitor discovery: rasol.fi returning "Web development" → fixed (prompt + context improvements)
- ✅ ANTHROPIC_API_KEY env var conflict → POSITIONING_RADAR_ANTHROPIC_KEY fallback
- ✅ Lazy Anthropic client initialization (avoids module-level env access)
- ✅ Debug logging cleaned up (kept concise operational logs)

### Admin Dashboard
- ✅ Admin dashboard at `/admin` with token auth (ADMIN_SECRET)
- ✅ Stats overview: total analyses, leads, weekly/monthly counts, industry breakdown
- ✅ Analyses table: URL, industry, locale, competitor count, date — filterable, paginated
- ✅ Leads table: email, source, analysis link, date — paginated
- ✅ CSV export for both analyses and leads
- ✅ HubSpot sync placeholder (Coming Soon button)

## 📋 TODO

### HubSpot Integration
- [ ] Add `HUBSPOT_API_KEY` env var
- [ ] Map lead fields to HubSpot contact properties (email, source, analysis URL)
- [ ] Custom HubSpot property: `positioning_radar_analysis_url`
- [ ] Batch sync endpoint: `/api/admin/hubspot-sync`
- [ ] Wire up "Sync to HubSpot" button in admin dashboard

### Privacy & Compliance
- [ ] Privacy notice on homepage
- [ ] Opt-out option for analytics tracking
- [ ] GDPR compliance check

### Polish & Production
- [x] PDF report generation from `result` JSONB
- [x] Rate limiting (API quota per IP — sliding window, in-memory)
- [x] Performance: cache Tavily/Claude responses
- [x] Mobile responsive polish
- [x] Add `ADMIN_SECRET` to Vercel production env

### UX Fixes
- [ ] Show analyzed URL clearly at top of results page (in the title or subtitle)
- [ ] Add "Copy URL" button/text to share the analysis results link
### Ideas / Experiments
- [ ] **Gated results A/B test**: Create alternate results page that shows ONLY user's company OR only competitors in free version. Full view unlocked with email. Keep current version live, test new version at separate route (e.g. `/results-v2/[id]`). Goal: test whether partial results drive higher email capture rate.
- [ ] **Cost calculator in admin dashboard**: Show how much analyses are costing (Claude API + Tavily tokens) based on real usage data. Views: total to date, weekly, monthly, with time selector. Estimate per-analysis cost breakdown.
- [ ] **AI API cost optimization**: Investigate and implement cost reduction strategies — prompt compression, model downgrade for simpler tasks (Haiku for competitor discovery?), response caching, batching, token budget limits.
- [ ] **User analysis history**: Let users see their own previous analyses (but not others'). Could use localStorage, cookies, or session-based tracking to associate analyses with a browser/user.

## 🔗 Key Files
- `src/lib/competitor-finder.ts` — Competitor discovery (scrape → Claude → Tavily → Claude)
- `src/lib/analyzer.ts` — Positioning analysis (Claude, 8192 tokens)
- `src/prompts/positioning-analysis.ts` — 4-analysis prompt
- `src/lib/types.ts` — All type definitions
- `src/components/` — UI components (map, 5-second test, health score, red flags, email gate)
- `src/app/[locale]/results/[id]/page.tsx` — Results page with gating
- `src/app/admin/page.tsx` — Admin dashboard
- `src/app/api/admin/` — Admin API routes (stats, analyses, leads)
- `src/lib/admin-auth.ts` — Admin token validation
- `src/lib/csv.ts` — CSV export utilities
- `supabase/migrations/20260306000000_initial.sql` — DB schema (analyses + leads)

## 📊 Database
- **`analyses`**: id, user_url, competitor_urls[], industry, locale, result (JSONB)
- **`leads`**: id, email, analysis_id (FK), source
