export function buildPositioningPrompt(
  companies: { url: string; content: string }[],
  userUrl: string,
  industry?: string,
  locale: string = "en"
) {
  const lang = locale === "fi" ? "Finnish" : "English";

  const companiesBlock = companies
    .map(
      (c, i) => `### Company ${i + 1}: ${c.url}
${c.content.slice(0, 4000)}`
    )
    .join("\n\n");

  return `You are a positioning strategist analyzing website positioning for competitive analysis.

## Task
Analyze the positioning of the following companies based on their website content.
The user's own company is: ${userUrl}

${industry ? `Industry context provided by user: ${industry}` : "Detect the industry automatically from the website content."}

## Companies to analyze
${companiesBlock}

## Instructions
1. Identify the industry these companies operate in
2. Choose the 2 most differentiating positioning axes for this industry
   - Axes should SEPARATE the companies, not cluster them
   - Axes should be strategically meaningful
   - Avoid axes where all companies score similarly
3. Score each company on both axes (-100 to +100)
4. Calculate a differentiation index (0-100) for each company
   - Higher = more unique positioning
   - Based on distance from the centroid of all companies
5. Generate 3-5 key insights about the positioning landscape
6. Generate specific recommendations for the user's company (${userUrl})

## Response format
Respond in ${lang}. Return ONLY valid JSON with this structure:
{
  "industry_context": "Brief description of the competitive landscape",
  "axes": {
    "x": { "label": "Axis name", "low_label": "Left end label", "high_label": "Right end label" },
    "y": { "label": "Axis name", "low_label": "Bottom end label", "high_label": "Top end label" }
  },
  "companies": [
    {
      "name": "Company Name (extracted from website)",
      "url": "https://...",
      "x_score": 0,
      "y_score": 0,
      "key_messages": ["Main value prop 1", "Main value prop 2"],
      "target_audience": "Who they target",
      "differentiation_summary": "What makes them unique",
      "differentiation_index": 50
    }
  ],
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Recommendation for user's company 1", "Recommendation 2"]
}`;
}
