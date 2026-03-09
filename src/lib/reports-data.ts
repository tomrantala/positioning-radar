import { PositioningResult } from "./types";

export interface ReportMeta {
  slug: string;
  titleKey: string;       // i18n key under "reports"
  descriptionKey: string; // i18n key under "reports"
  companies: string[];    // Display names for the card
  emoji: string;
}

export const REPORTS: ReportMeta[] = [
  {
    slug: "crm",
    titleKey: "crm.title",
    descriptionKey: "crm.description",
    companies: ["HubSpot", "Salesforce", "Pipedrive"],
    emoji: "📊",
  },
  {
    slug: "design",
    titleKey: "design.title",
    descriptionKey: "design.description",
    companies: ["Figma", "Sketch", "Adobe XD"],
    emoji: "🎨",
  },
  {
    slug: "ecommerce",
    titleKey: "ecommerce.title",
    descriptionKey: "ecommerce.description",
    companies: ["Shopify", "WooCommerce", "BigCommerce"],
    emoji: "🛒",
  },
];

export function getReportBySlug(slug: string): ReportMeta | undefined {
  return REPORTS.find((r) => r.slug === slug);
}

// Pre-determined positioning data for each report
export function getReportData(slug: string): PositioningResult | null {
  const data = REPORT_DATA[slug];
  return data ?? null;
}

const REPORT_DATA: Record<string, PositioningResult> = {
  crm: {
    id: "report-crm",
    created_at: "2026-03-01T00:00:00Z",
    industry_context: "CRM / Sales Software",
    user_company_url: "https://hubspot.com",
    axes: {
      x: { label: "Product Scope", low_label: "Focused CRM", high_label: "All-in-One Platform" },
      y: { label: "Target Market", low_label: "SMB / Startup", high_label: "Enterprise" },
    },
    companies: [
      {
        name: "HubSpot",
        url: "https://hubspot.com",
        x_score: 75,
        y_score: 35,
        key_messages: [
          "Grow better with an all-in-one platform",
          "Free CRM with powerful upgrade paths",
          "Easy to use, hard to outgrow",
        ],
        target_audience: "SMBs and scaling companies",
        differentiation_summary: "Positions as the accessible all-in-one platform that grows with you. Strong inbound marketing heritage gives unique credibility.",
        differentiation_index: 82,
        positioning_health: {
          total_score: 78,
          best_customers: { score: 85, summary: "Clearly targets growing SMBs and mid-market companies. The 'grow better' message resonates with scaling teams." },
          competitive_alternatives: { score: 72, summary: "Acknowledges competition implicitly through free tier and ease-of-use positioning. Could be more explicit about alternatives." },
          unique_attributes: { score: 80, summary: "Free CRM + all-in-one platform + inbound methodology is a genuinely unique combination in the market." },
          value_creators: { score: 75, summary: "Value proposition is clear: reduce complexity and cost while scaling. Could quantify ROI more specifically." },
          category: { score: 82, summary: "Has effectively created its own sub-category: the 'customer platform' that unifies marketing, sales, and service." },
          unique_value_propositions: { score: 74, summary: "Strong but could differentiate more sharply from Salesforce's ecosystem play." },
        },
        five_second_test: {
          clarity_score: 8,
          first_impression: "Modern, friendly business platform",
          identified_offering: "CRM and marketing platform",
          target_audience_guess: "Growing businesses",
          emotional_tone: "Approachable and empowering",
        },
        red_flags: [],
        red_flag_details: [],
      },
      {
        name: "Salesforce",
        url: "https://salesforce.com",
        x_score: 85,
        y_score: 80,
        key_messages: [
          "The #1 AI CRM",
          "Connect with your customers in a whole new way",
          "Every app, every experience, one platform",
        ],
        target_audience: "Enterprise organizations",
        differentiation_summary: "Dominates enterprise CRM with ecosystem depth. AI positioning (Einstein) adds modern relevance but risks feeling buzzwordy.",
        differentiation_index: 70,
        positioning_health: {
          total_score: 65,
          best_customers: { score: 70, summary: "Targets enterprise broadly but messaging tries to appeal to everyone, diluting specificity." },
          competitive_alternatives: { score: 55, summary: "Relies on market leadership claims rather than articulating why Salesforce over specific alternatives." },
          unique_attributes: { score: 68, summary: "Ecosystem breadth is genuinely unique, but 'AI CRM' claim is increasingly commoditized." },
          value_creators: { score: 60, summary: "Value messaging is abstract — 'connect with customers in a whole new way' lacks concreteness." },
          category: { score: 75, summary: "Strong category ownership of 'enterprise CRM' but stretching into 'customer platform' blurs positioning." },
          unique_value_propositions: { score: 62, summary: "Scale and ecosystem are real differentiators but not articulated compellingly enough for newcomers." },
        },
        five_second_test: {
          clarity_score: 6,
          first_impression: "Big enterprise tech company",
          identified_offering: "CRM software",
          target_audience_guess: "Large businesses",
          emotional_tone: "Corporate and ambitious",
        },
        red_flags: ["buzzword_overload", "generic_terminology"],
        red_flag_details: [
          { flag: "buzzword_overload", severity: "medium", explanation: "'#1 AI CRM' and 'whole new way' rely on buzz rather than substance.", suggestion: "Show specific AI capabilities with concrete outcomes." },
          { flag: "generic_terminology", severity: "low", explanation: "'Connect with customers' is used by virtually every CRM provider.", suggestion: "Replace with Salesforce-specific language about what the connection enables." },
        ],
      },
      {
        name: "Pipedrive",
        url: "https://pipedrive.com",
        x_score: 25,
        y_score: 20,
        key_messages: [
          "Easy and effective CRM for closing deals",
          "Built by salespeople, for salespeople",
          "The CRM designed to help you sell more",
        ],
        target_audience: "Sales teams in SMBs",
        differentiation_summary: "Sharp positioning around sales-first CRM. The 'by salespeople' origin story is authentic and memorable.",
        differentiation_index: 88,
        positioning_health: {
          total_score: 82,
          best_customers: { score: 90, summary: "Crystal clear: salespeople in small to mid-size businesses. No ambiguity in the target." },
          competitive_alternatives: { score: 78, summary: "Implicitly positions against complex CRMs like Salesforce. Could be more explicit about the comparison." },
          unique_attributes: { score: 85, summary: "'Built by salespeople' is a genuine, verifiable origin story that most CRMs cannot claim." },
          value_creators: { score: 80, summary: "'Sell more' and 'close deals' are concrete, measurable outcomes that resonate with sales teams." },
          category: { score: 88, summary: "Owns the 'sales-first CRM' niche decisively. Doesn't try to be everything to everyone." },
          unique_value_propositions: { score: 72, summary: "Strong niche positioning but could articulate why pipeline-centric approach delivers better results." },
        },
        five_second_test: {
          clarity_score: 9,
          first_impression: "Simple, sales-focused tool",
          identified_offering: "Sales CRM",
          target_audience_guess: "Sales teams",
          emotional_tone: "Direct and practical",
        },
        red_flags: [],
        red_flag_details: [],
      },
    ],
    insights: [
      "Pipedrive has the strongest positioning clarity despite being the smallest player — proof that niche focus beats broad ambition.",
      "Salesforce's 'AI CRM' claim is at risk of becoming generic as every CRM adds AI features.",
      "HubSpot's free tier strategy is a positioning moat — it's both a product and a marketing message.",
    ],
    recommendations: [
      "Study Pipedrive's approach: pick one audience and own it completely before expanding.",
      "Avoid 'AI-powered' as a primary differentiator — it's becoming table stakes in the CRM category.",
      "Consider a concrete origin story like Pipedrive's 'built by salespeople' — authenticity beats polish.",
    ],
  },
  design: {
    id: "report-design",
    created_at: "2026-03-01T00:00:00Z",
    industry_context: "Design Tools / UX Software",
    user_company_url: "https://figma.com",
    axes: {
      x: { label: "Collaboration", low_label: "Individual", high_label: "Team-First" },
      y: { label: "Scope", low_label: "UI Design Only", high_label: "Full Design System" },
    },
    companies: [
      {
        name: "Figma",
        url: "https://figma.com",
        x_score: 90,
        y_score: 75,
        key_messages: [
          "Design together, build together",
          "The collaborative interface design tool",
          "From design to development, in one platform",
        ],
        target_audience: "Design teams and cross-functional product teams",
        differentiation_summary: "Owns 'collaborative design' positioning. Browser-based approach was initially controversial but became the category standard.",
        differentiation_index: 90,
        positioning_health: {
          total_score: 86,
          best_customers: { score: 88, summary: "Targets design teams embedded in product organizations. The collaboration focus attracts cross-functional teams naturally." },
          competitive_alternatives: { score: 82, summary: "Has effectively positioned all desktop-only tools as legacy alternatives." },
          unique_attributes: { score: 92, summary: "Browser-native, real-time multiplayer is genuinely unique and defensible." },
          value_creators: { score: 85, summary: "Speed, collaboration, and reducing designer-developer handoff friction are concrete, measurable values." },
          category: { score: 88, summary: "Has redefined the category from 'design tools' to 'collaborative design platforms.' Category creation at its finest." },
          unique_value_propositions: { score: 80, summary: "Strong but post-Adobe acquisition, the independent challenger narrative needs updating." },
        },
        five_second_test: {
          clarity_score: 9,
          first_impression: "Modern, collaborative design platform",
          identified_offering: "Design tool for teams",
          target_audience_guess: "Designers and developers",
          emotional_tone: "Innovative and inclusive",
        },
        red_flags: [],
        red_flag_details: [],
      },
      {
        name: "Sketch",
        url: "https://sketch.com",
        x_score: 40,
        y_score: 50,
        key_messages: [
          "Design toolkit built for Mac",
          "Professional digital design for Mac",
          "Design, prototype, collaborate",
        ],
        target_audience: "Professional designers on Mac",
        differentiation_summary: "Mac-native positioning is both strength and limitation. Loyal base but losing ground to platform-agnostic competitors.",
        differentiation_index: 55,
        positioning_health: {
          total_score: 58,
          best_customers: { score: 65, summary: "Mac designers are a clear audience but the market has shifted to platform-agnostic workflows." },
          competitive_alternatives: { score: 45, summary: "Doesn't address why users should choose Sketch over Figma — the comparison is conspicuously absent." },
          unique_attributes: { score: 60, summary: "Mac-native performance and established plugin ecosystem are real but losing relevance." },
          value_creators: { score: 55, summary: "Professional quality is assumed, not differentiated. Needs to articulate specific workflow advantages." },
          category: { score: 62, summary: "Was the category creator but has ceded category definition to Figma." },
          unique_value_propositions: { score: 50, summary: "Struggling to articulate why Sketch in 2026 when browsers do everything." },
        },
        five_second_test: {
          clarity_score: 6,
          first_impression: "Traditional design software",
          identified_offering: "Design tool for Mac",
          target_audience_guess: "Mac designers",
          emotional_tone: "Professional but dated",
        },
        red_flags: ["interchangeable_messaging"],
        red_flag_details: [
          { flag: "interchangeable_messaging", severity: "medium", explanation: "'Design, prototype, collaborate' could describe any modern design tool.", suggestion: "Lead with what makes Sketch's Mac-native experience genuinely better, not just different." },
        ],
      },
      {
        name: "Adobe XD",
        url: "https://adobe.com/products/xd",
        x_score: 55,
        y_score: 65,
        key_messages: [
          "Fast & powerful UI/UX design tool",
          "Part of the Creative Cloud ecosystem",
          "Design, prototype, share",
        ],
        target_audience: "Designers already in Adobe ecosystem",
        differentiation_summary: "Leverages Adobe ecosystem integration. Positioning is defensive — keeping existing Adobe users rather than attracting new ones.",
        differentiation_index: 42,
        positioning_health: {
          total_score: 48,
          best_customers: { score: 50, summary: "Targets existing Adobe users but doesn't give them a compelling reason to use XD over Figma within the same ecosystem." },
          competitive_alternatives: { score: 40, summary: "Ignores the competitive landscape entirely. No mention of why XD over the clear market leader." },
          unique_attributes: { score: 45, summary: "Creative Cloud integration is a convenience, not a unique design capability." },
          value_creators: { score: 48, summary: "'Fast & powerful' is generic and unsubstantiated. Every tool claims this." },
          category: { score: 55, summary: "Part of a larger suite — lacks standalone category identity." },
          unique_value_propositions: { score: 50, summary: "No clear value proposition beyond being the Adobe option." },
        },
        five_second_test: {
          clarity_score: 5,
          first_impression: "Another Adobe product",
          identified_offering: "UI design tool",
          target_audience_guess: "Adobe subscribers",
          emotional_tone: "Corporate and functional",
        },
        red_flags: ["generic_terminology", "self_focused_language"],
        red_flag_details: [
          { flag: "generic_terminology", severity: "high", explanation: "'Fast & powerful' and 'design, prototype, share' describe every design tool on the market.", suggestion: "Identify what's genuinely unique about XD's approach — perhaps deep Photoshop/Illustrator integration for designers who use the full Creative Cloud." },
          { flag: "self_focused_language", severity: "medium", explanation: "Positioning focuses on Adobe's ecosystem benefits rather than user outcomes.", suggestion: "Shift to 'what designers can achieve' rather than 'what Adobe offers.'" },
        ],
      },
    ],
    insights: [
      "Figma created a new category by making design multiplayer — proving that product innovation and positioning innovation go hand in hand.",
      "Sketch's Mac-native positioning went from advantage to limitation as the market shifted to browser-based tools.",
      "Adobe XD illustrates the danger of 'ecosystem positioning' — being part of a suite isn't a standalone value proposition.",
    ],
    recommendations: [
      "To compete with a category creator like Figma, you must either redefine the category or own a specific niche within it.",
      "Platform dependency (Mac-only, ecosystem-locked) is increasingly a positioning liability, not an asset.",
      "Avoid 'design, prototype, share' — this is the 2026 equivalent of table stakes. Lead with what's genuinely unique.",
    ],
  },
  ecommerce: {
    id: "report-ecommerce",
    created_at: "2026-03-01T00:00:00Z",
    industry_context: "E-commerce Platforms",
    user_company_url: "https://shopify.com",
    axes: {
      x: { label: "Technical Complexity", low_label: "Plug & Play", high_label: "Developer-Centric" },
      y: { label: "Scale", low_label: "Small Business", high_label: "Enterprise" },
    },
    companies: [
      {
        name: "Shopify",
        url: "https://shopify.com",
        x_score: 30,
        y_score: 55,
        key_messages: [
          "Making commerce better for everyone",
          "Your business, your way",
          "Build an online store in minutes",
        ],
        target_audience: "Entrepreneurs and growing businesses",
        differentiation_summary: "Dominates the 'easy e-commerce' category with aspirational brand positioning. Successfully expanded upmarket while maintaining accessibility.",
        differentiation_index: 80,
        positioning_health: {
          total_score: 74,
          best_customers: { score: 80, summary: "Core audience of entrepreneurs is well-served, though enterprise expansion dilutes the message slightly." },
          competitive_alternatives: { score: 68, summary: "Positioned against DIY solutions and complex platforms alike. Could be sharper about specific competitors." },
          unique_attributes: { score: 78, summary: "App ecosystem, Shopify Payments, and brand trust create a genuine moat." },
          value_creators: { score: 72, summary: "'Build in minutes' is concrete. 'Making commerce better for everyone' is aspirational but vague." },
          category: { score: 80, summary: "Strong category ownership of 'easy e-commerce platform.' Shopify IS the category for many." },
          unique_value_propositions: { score: 68, summary: "Scale from $0 to $1B+ on one platform is compelling but not always articulated clearly." },
        },
        five_second_test: {
          clarity_score: 8,
          first_impression: "Friendly online store builder",
          identified_offering: "E-commerce platform",
          target_audience_guess: "Online sellers",
          emotional_tone: "Empowering and accessible",
        },
        red_flags: [],
        red_flag_details: [],
      },
      {
        name: "WooCommerce",
        url: "https://woocommerce.com",
        x_score: 70,
        y_score: 30,
        key_messages: [
          "The open-source e-commerce platform for WordPress",
          "Build exactly the store you want",
          "Customize everything with code",
        ],
        target_audience: "WordPress users and developers",
        differentiation_summary: "Open-source and WordPress integration are genuine differentiators. Positioning appeals to control-minded builders rather than convenience seekers.",
        differentiation_index: 72,
        positioning_health: {
          total_score: 68,
          best_customers: { score: 75, summary: "WordPress developers and agencies are a well-defined, loyal audience. Community strength is a positioning asset." },
          competitive_alternatives: { score: 65, summary: "Implicitly positions against proprietary platforms. The open-source angle naturally attracts cost-conscious and control-minded users." },
          unique_attributes: { score: 78, summary: "WordPress integration, open-source code, and complete customization freedom are genuinely unique in the market." },
          value_creators: { score: 62, summary: "Free core product is compelling but total cost of ownership (hosting, plugins, maintenance) isn't addressed." },
          category: { score: 70, summary: "Owns 'open-source e-commerce' clearly but the WordPress dependency limits category expansion." },
          unique_value_propositions: { score: 58, summary: "Freedom and control are strong values but need to be balanced with ease-of-use proof points." },
        },
        five_second_test: {
          clarity_score: 7,
          first_impression: "WordPress e-commerce plugin",
          identified_offering: "Online store for WordPress",
          target_audience_guess: "WordPress site owners",
          emotional_tone: "Technical and open",
        },
        red_flags: [],
        red_flag_details: [],
      },
      {
        name: "BigCommerce",
        url: "https://bigcommerce.com",
        x_score: 55,
        y_score: 70,
        key_messages: [
          "The open SaaS e-commerce platform",
          "Built for growth, built for you",
          "Enterprise-grade without the complexity",
        ],
        target_audience: "Mid-market and enterprise businesses",
        differentiation_summary: "The 'open SaaS' positioning tries to combine best of open-source and SaaS. Clear differentiation strategy but market awareness is lower.",
        differentiation_index: 65,
        positioning_health: {
          total_score: 60,
          best_customers: { score: 58, summary: "Mid-market is defined but not as crisply as Shopify's entrepreneur or WooCommerce's developer." },
          competitive_alternatives: { score: 62, summary: "'Open SaaS' directly addresses the Shopify-lock-in concern and WooCommerce-complexity issue." },
          unique_attributes: { score: 65, summary: "'Open SaaS' is a genuinely unique positioning concept that no other major competitor claims." },
          value_creators: { score: 55, summary: "'Enterprise-grade without complexity' is a good promise but lacks specificity on what 'enterprise-grade' means." },
          category: { score: 68, summary: "Attempting to create a new sub-category with 'open SaaS' — ambitious but market hasn't fully adopted the term." },
          unique_value_propositions: { score: 52, summary: "The middle ground between Shopify and WooCommerce is clear strategically but harder to communicate viscerally." },
        },
        five_second_test: {
          clarity_score: 6,
          first_impression: "Business e-commerce solution",
          identified_offering: "E-commerce platform",
          target_audience_guess: "Medium to large businesses",
          emotional_tone: "Professional and growth-oriented",
        },
        red_flags: ["generic_terminology"],
        red_flag_details: [
          { flag: "generic_terminology", severity: "medium", explanation: "'Built for growth, built for you' is generic and could apply to any platform.", suggestion: "Lean harder into the 'open SaaS' differentiator — it's unique. Make it the headline, not the tagline." },
        ],
      },
    ],
    insights: [
      "Shopify wins on brand and simplicity, but its 'for everyone' messaging risks dilution as it pushes upmarket.",
      "WooCommerce's open-source positioning creates natural loyalty but limits appeal beyond the WordPress community.",
      "BigCommerce's 'open SaaS' is the most strategic positioning but needs stronger market education to gain traction.",
    ],
    recommendations: [
      "If you're in a crowded market, pick one axis and own it completely — don't try to be both the easiest AND the most powerful.",
      "Open-source positioning works best when paired with strong community and ecosystem messaging.",
      "Category creation ('open SaaS') is high-reward but requires consistent messaging investment to stick.",
    ],
  },
};
