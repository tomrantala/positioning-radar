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

## 📋 TODO

### Lead Mining & Analytics
- [ ] Admin dashboard — query `analyses` table for insights
  - Total analyses by industry
  - Trending industries
  - Companies by locale/date
- [ ] Lead export — CSV/JSON from `analyses` table for CRM
- [ ] Privacy compliance: notice on homepage, opt-out, GDPR check

### Polish & Production
- [ ] PDF report generation from `result` JSONB
- [ ] Rate limiting (API quota per IP)
- [ ] Performance: cache Tavily/Claude responses
- [ ] Mobile responsive polish
- [ ] Add POSITIONING_RADAR_ANTHROPIC_KEY to Vercel production env

## 🔗 Key Files
- `src/lib/competitor-finder.ts` — Competitor discovery (scrape → Claude → Tavily → Claude)
- `src/lib/analyzer.ts` — Positioning analysis (Claude, 8192 tokens)
- `src/prompts/positioning-analysis.ts` — 4-analysis prompt
- `src/lib/types.ts` — All type definitions
- `src/components/` — UI components (map, 5-second test, health score, red flags, email gate)
- `src/app/[locale]/results/[id]/page.tsx` — Results page with gating
- `supabase/migrations/20260306000000_initial.sql` — DB schema (analyses + leads)

## 📊 Database
- **`analyses`**: id, user_url, competitor_urls[], industry, locale, result (JSONB)
- **`leads`**: id, email, analysis_id (FK), source
