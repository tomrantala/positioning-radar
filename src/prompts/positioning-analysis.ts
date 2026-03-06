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
${c.content.slice(0, 5000)}`
    )
    .join("\n\n");

  return `You are a positioning analyst using MEOM's 6-element positioning framework. You provide objective, data-driven analysis for the free sections, and actionable recommendations for the gated section.

## Task
Analyze the positioning of the following companies based on their website content.
The user's own company is: ${userUrl}

${industry ? `Industry: ${industry}` : "Detect the industry automatically from the website content."}

## Companies to analyze
${companiesBlock}

## Analysis 1: Positioning Map
1. Identify the 2 most differentiating positioning axes for this industry
   - Axes should SEPARATE the companies, not cluster them
   - Axes should be strategically meaningful for the industry
   - Avoid axes where all companies score similarly
2. Score each company on both axes (-100 to +100)
3. Calculate a differentiation index (0-100) for each company
   - Higher = more unique positioning
   - Based on distance from the centroid of all companies
4. Generate 3-5 key OBSERVATIONS about the positioning landscape
   - Be neutral and factual — describe what IS, not what should be
   - Example: "Three of five companies cluster in the specialist/premium quadrant, leaving the generalist/affordable space open"
   - Do NOT give recommendations in insights

## Analysis 2: 5 Second Test (per company)
Evaluate the hero section of each company's website: would an outsider understand within 5 seconds what the company does and who it's for?
- result: "pass" | "partial" | "fail"
- what_visitor_understands: what a visitor grasps in 5 seconds
- what_is_unclear: what remains unclear (if partial or fail; empty string if pass)

## Analysis 3: Positioning Health Score (per company)
Evaluate each company using MEOM's 6 positioning elements, scoring each 0-100:
1. best_customers — Is the target audience identifiable? Does the site speak to a specific segment or to everyone?
2. competitive_alternatives — Does the messaging acknowledge alternatives? Does it position relative to something?
3. unique_attributes — Are there hard-to-copy differentiators? Not just "quality" or "experience" but genuinely unique factors?
4. value_creators — Is value articulated from the customer's perspective? Are outcomes concrete?
5. category — Does a visitor immediately know what this company does and in what context?
6. unique_value_propositions — Is the value proposition unique or interchangeable with competitors?

For each element: provide a score (0-100) and a brief summary explaining the score.
Calculate total_score as the arithmetic mean of the 6 element scores (rounded to nearest integer).

## Analysis 4: Red Flags (per company)
Flag ONLY the problems that actually apply to each company. Do not list all 5 for every company.
Possible red flag types:
- generic_terminology: Generic phrases that could be swapped onto any competitor's site
- self_focused_language: Company talks about itself ("we do", "we have") instead of the customer's problem
- missing_pain_points: No mention of customer challenges or needs
- buzzword_overload: Abstract terms without concrete meaning
- interchangeable_messaging: Messaging is practically interchangeable with competitors

For each flagged item, provide:
- type: the red flag type
- example: a concrete quote or example from the website
- suggestion: how to fix it

## Recommendations (for the user's company only)
Provide 3-5 actionable, specific recommendations for the user's company (${userUrl}).
These should be based on the positioning analysis, health score, and red flags.
Focus on concrete improvements, not generic advice.

## Important: Tone
- Analyses 1-4 are neutral and objective — like a research report
- Recommendations section is actionable and specific — like a consultant's advice
- Describe patterns, gaps, and clusters in observations — not what companies should do
- Save all "you should" statements for the recommendations section only

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
      "differentiation_index": 50,
      "five_second_test": {
        "result": "pass",
        "what_visitor_understands": "What a visitor grasps in 5 seconds",
        "what_is_unclear": ""
      },
      "positioning_health": {
        "total_score": 65,
        "best_customers": { "score": 70, "summary": "Brief explanation" },
        "competitive_alternatives": { "score": 50, "summary": "Brief explanation" },
        "unique_attributes": { "score": 60, "summary": "Brief explanation" },
        "value_creators": { "score": 75, "summary": "Brief explanation" },
        "category": { "score": 80, "summary": "Brief explanation" },
        "unique_value_propositions": { "score": 55, "summary": "Brief explanation" }
      },
      "red_flags": ["generic_terminology"],
      "red_flag_details": [
        {
          "type": "generic_terminology",
          "example": "Concrete quote from the website",
          "suggestion": "How to improve this"
        }
      ]
    }
  ],
  "insights": ["Neutral observation 1", "Observation 2", "Observation 3"],
  "recommendations": ["Specific recommendation for the user's company 1", "Recommendation 2", "Recommendation 3"]
}`;
}
