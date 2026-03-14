# Web Search Competitor Detection

## Problem

Current `askClaudeForCompetitors` asks Claude to name competitors based solely on the URL, without web access. Claude hallucinates competitors for small/medium companies it doesn't know well (e.g., returned "Sisudigital", "Valfi Digital" for MEOM instead of real competitors like Morgan Digital, Avidly, Generaxion).

Claude Chat finds correct competitors because it has web search — it finds articles like Vierityspalkki.fi that name actual competitors.

## Solution

Use Anthropic API's built-in `web_search_20250305` tool so Claude can search the web during competitor detection. This grounds responses in real data instead of training-data guesses.

## Architecture

```
findCompetitors(url, locale, market)
  ├── Claude + web_search tool (max_uses: 3)
  │   ├── Claude searches: "[company] competitors", "[industry] companies [market]"
  │   └── Returns grounded competitors with source URLs
  ├── Cache result (30min TTL)
  └── Fallback: current Tavily flow (if web search fails)
```

## Changes

### 1. `askClaudeForCompetitors` — add web_search tool

- Add `web_search_20250305` to tools array with `max_uses: 3`
- Set `user_location` based on market parameter (Finland → Helsinki, etc.)
- Update prompt to instruct Claude to search before answering
- Remove confidence field — web search makes results reliable

### 2. Simplify `findCompetitors` main function

- Remove confidence-based branching (high/low)
- Keep Tavily fallback only for error cases
- Keep cache and background scrape warming

### 3. Update prompt

Tell Claude to:
- Search for the company first to understand what they do
- Search for competitors in the specified market
- Only return competitors it found in search results
- Include working URLs verified from search

### 4. Update tests

- Mock web_search tool responses in tests
- Test market-specific location mapping
- Test fallback behavior

## Cost

- ~$0.01/search × 3 searches = $0.03 per competitor detection
- Plus token costs ~$0.01
- Total ~$0.04/analysis (up from ~$0.01)

## Model

Keep `claude-sonnet-4-20250514` — supports web search, cost-effective.
