import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ReportsPage from "../page";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Positioning Reports",
      subtitle: "See how major brands position themselves.",
      viewReport: "View report",
      "crm.title": "CRM Platforms",
      "crm.description": "How HubSpot, Salesforce, and Pipedrive position themselves.",
      "design.title": "Design Tools",
      "design.description": "Figma vs Sketch vs Adobe XD.",
      "ecommerce.title": "E-commerce Platforms",
      "ecommerce.description": "Shopify, WooCommerce, and BigCommerce.",
      analyzeYours: "Analyze your own positioning",
    };
    return translations[key] || key;
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("ReportsPage", () => {
  it("renders the reports page title", () => {
    render(<ReportsPage />);
    expect(screen.getByText("Positioning Reports")).toBeInTheDocument();
  });

  it("renders report cards for each industry", () => {
    render(<ReportsPage />);
    expect(screen.getByText("CRM Platforms")).toBeInTheDocument();
    expect(screen.getByText("Design Tools")).toBeInTheDocument();
    expect(screen.getByText("E-commerce Platforms")).toBeInTheDocument();
  });

  it("renders view report links for each report", () => {
    render(<ReportsPage />);
    const links = screen.getAllByText(/View report/);
    expect(links).toHaveLength(3);
  });

  it("links to individual report pages", () => {
    render(<ReportsPage />);
    const links = screen.getAllByRole("link");
    const reportLinks = links.filter((l) => l.getAttribute("href")?.startsWith("/reports/"));
    expect(reportLinks).toHaveLength(3);
    const hrefs = reportLinks.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/reports/crm");
    expect(hrefs).toContain("/reports/design");
    expect(hrefs).toContain("/reports/ecommerce");
  });

  it("includes company names in the cards", () => {
    render(<ReportsPage />);
    expect(screen.getByText("HubSpot")).toBeInTheDocument();
    expect(screen.getByText("Figma")).toBeInTheDocument();
    expect(screen.getByText("Shopify")).toBeInTheDocument();
  });

  it("includes a CTA to analyze your own positioning", () => {
    render(<ReportsPage />);
    const ctas = screen.getAllByText("Analyze your own positioning");
    expect(ctas.length).toBeGreaterThanOrEqual(1);
    const ctaLink = ctas.find((el) => el.closest("a")?.getAttribute("href") === "/");
    expect(ctaLink).toBeTruthy();
  });
});
