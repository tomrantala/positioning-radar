import { jsPDF } from "jspdf";
import { CompanyAnalysis, PositioningResult, RedFlagType } from "./types";

const MARGIN = 20;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const RED_FLAG_LABELS: Record<RedFlagType, string> = {
  generic_terminology: "Generic Terminology",
  self_focused_language: "Self-Focused Language",
  missing_pain_points: "Missing Pain Points",
  buzzword_overload: "Buzzword Overload",
  interchangeable_messaging: "Interchangeable Messaging",
};

/**
 * Generate a PDF report from a positioning analysis result.
 * Returns a jsPDF instance — call .save() or .output() on it.
 */
export function generateReport(result: PositioningResult): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  // --- Title ---
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Positioning Radar Report", MARGIN, y);
  y += 12;

  // --- Industry Context ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(result.industry_context, MARGIN, y);
  doc.setTextColor(0);
  y += 10;

  // --- Companies ---
  for (const company of result.companies) {
    y = ensureSpace(doc, y, 40);

    // Company header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(company.name, MARGIN, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(company.url, MARGIN, y);
    doc.setTextColor(0);
    y += 7;

    // Differentiation
    doc.setFontSize(10);
    doc.text(`Differentiation: ${company.differentiation_index}/100`, MARGIN, y);
    y += 5;

    const summaryLines = doc.splitTextToSize(company.differentiation_summary, CONTENT_WIDTH);
    doc.text(summaryLines, MARGIN, y);
    y += summaryLines.length * 4.5 + 4;

    // 5 Second Test
    if (company.five_second_test) {
      y = renderFiveSecondTest(doc, y, company);
    }

    // Positioning Health
    if (company.positioning_health) {
      y = renderHealthScore(doc, y, company);
    }

    // Red Flags
    if (company.red_flag_details && company.red_flag_details.length > 0) {
      y = renderRedFlags(doc, y, company);
    }
  }

  // --- Insights ---
  if (result.insights.length > 0) {
    y = ensureSpace(doc, y, 30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Key Insights", MARGIN, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    for (const insight of result.insights) {
      y = ensureSpace(doc, y, 10);
      const lines = doc.splitTextToSize(`• ${insight}`, CONTENT_WIDTH);
      doc.text(lines, MARGIN, y);
      y += lines.length * 4.5 + 2;
    }
    y += 4;
  }

  // --- Footer ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text(
      `Positioning Radar by MEOM — Page ${i}/${pageCount}`,
      PAGE_WIDTH / 2,
      290,
      { align: "center" }
    );
  }
  doc.setTextColor(0);

  return doc;
}

function renderFiveSecondTest(doc: jsPDF, y: number, company: CompanyAnalysis): number {
  const test = company.five_second_test!;
  y = ensureSpace(doc, y, 30);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("5 Second Test", MARGIN + 4, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const label = test.result.toUpperCase();
  doc.text(`Result: ${label}`, MARGIN + 4, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // What visitor understands
  doc.setFont("helvetica", "bold");
  doc.text("Understands:", MARGIN + 4, y);
  doc.setFont("helvetica", "normal");
  y += 4;
  const understandLines = doc.splitTextToSize(test.what_visitor_understands, CONTENT_WIDTH - 8);
  doc.text(understandLines, MARGIN + 4, y);
  y += understandLines.length * 4 + 3;

  // What is unclear
  doc.setFont("helvetica", "bold");
  doc.text("Unclear:", MARGIN + 4, y);
  doc.setFont("helvetica", "normal");
  y += 4;
  const unclearLines = doc.splitTextToSize(test.what_is_unclear, CONTENT_WIDTH - 8);
  doc.text(unclearLines, MARGIN + 4, y);
  y += unclearLines.length * 4 + 6;

  return y;
}

function renderHealthScore(doc: jsPDF, y: number, company: CompanyAnalysis): number {
  const health = company.positioning_health!;
  y = ensureSpace(doc, y, 50);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Positioning Health: ${health.total_score}/100`, MARGIN + 4, y);
  y += 8;

  const elements = [
    { label: "Best Customers", data: health.best_customers },
    { label: "Competitive Alternatives", data: health.competitive_alternatives },
    { label: "Unique Attributes", data: health.unique_attributes },
    { label: "Value Creators", data: health.value_creators },
    { label: "Category", data: health.category },
    { label: "Unique Value Propositions", data: health.unique_value_propositions },
  ];

  doc.setFontSize(9);
  for (const el of elements) {
    y = ensureSpace(doc, y, 12);
    doc.setFont("helvetica", "bold");
    doc.text(`${el.label}: ${el.data.score}/100`, MARGIN + 4, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(el.data.summary, CONTENT_WIDTH - 8);
    doc.text(lines, MARGIN + 4, y);
    y += lines.length * 3.5 + 3;
  }
  y += 4;

  return y;
}

function renderRedFlags(doc: jsPDF, y: number, company: CompanyAnalysis): number {
  const flags = company.red_flag_details!;
  y = ensureSpace(doc, y, 30);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Red Flags (${flags.length})`, MARGIN + 4, y);
  y += 7;

  doc.setFontSize(9);
  for (const flag of flags) {
    y = ensureSpace(doc, y, 20);

    doc.setFont("helvetica", "bold");
    doc.text(RED_FLAG_LABELS[flag.type] || flag.type, MARGIN + 4, y);
    y += 4;

    doc.setFont("helvetica", "italic");
    const exampleLines = doc.splitTextToSize(`"${flag.example}"`, CONTENT_WIDTH - 8);
    doc.text(exampleLines, MARGIN + 4, y);
    y += exampleLines.length * 3.5 + 2;

    doc.setFont("helvetica", "normal");
    const sugLines = doc.splitTextToSize(`-> ${flag.suggestion}`, CONTENT_WIDTH - 8);
    doc.text(sugLines, MARGIN + 4, y);
    y += sugLines.length * 3.5 + 4;
  }
  y += 4;

  return y;
}

/** Add a new page if not enough space remains */
function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 280) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}
