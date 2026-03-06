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

  return `You are a neutral positioning analyst. You provide objective, data-driven analysis without opinions or recommendations.

## Task
Analyze the positioning of the following companies based on their website content.
The user's own company is: ${userUrl}

${industry ? `Industry: ${industry}` : "Detect the industry automatically from the website content."}

## Companies to analyze
${companiesBlock}

## Instructions
1. Identify the industry these companies operate in
2. Choose the 2 most differentiating positioning axes for this industry
   - Axes should SEPARATE the companies, not cluster them
   - Axes should be strategically meaningful for the industry
   - Avoid axes where all companies score similarly
3. Score each company on both axes (-100 to +100)
4. Calculate a differentiation index (0-100) for each company
   - Higher = more unique positioning
   - Based on distance from the centroid of all companies
5. Generate 3-5 key OBSERVATIONS about the positioning landscape
   - Be neutral and factual — describe what IS, not what should be
   - Example: "Three of five companies cluster in the specialist/premium quadrant, leaving the generalist/affordable space open"
   - Do NOT give recommendations or opinions

## Important: Tone
- This is a neutral, objective analysis — like a research report
- Describe patterns, gaps, and clusters — not what companies should do
- No recommendations, no value judgments, no "you should" statements

## Response format
Respond in ${lang}. Return ONLY valid JSON with this structure:
{
  "industry_context": "Neutral description of the competitive landscape",
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
      "differentiation_summary": "Neutral description of their positioning",
      "differentiation_index": 50
    }
  ],
  "insights": ["Neutral observation 1", "Observation 2", "Observation 3"]
}`;
}
