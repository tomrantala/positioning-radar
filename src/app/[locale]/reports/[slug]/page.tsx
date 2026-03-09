"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getReportBySlug, getReportData } from "@/lib/reports-data";
import PositioningScoreGauge from "@/components/PositioningScoreGauge";
import PositioningMap from "@/components/PositioningMap";
import InsightCards from "@/components/InsightCards";
import DifferentiationScore from "@/components/DifferentiationScore";
import FiveSecondTest from "@/components/FiveSecondTest";
import PositioningHealthDetail from "@/components/PositioningHealthDetail";
import RedFlags from "@/components/RedFlags";
import { Link } from "@/i18n/navigation";

export default function ReportDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const slug = params.slug as string;

  const meta = getReportBySlug(slug);
  const result = getReportData(slug);

  if (!meta || !result) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Report not found</p>
          <Link href="/reports" className="text-red-600 hover:text-red-700 font-medium">
            {t("reports.backToReports")}
          </Link>
        </div>
      </div>
    );
  }

  const firstCompany = result.companies[0];
  const score = firstCompany?.positioning_health?.total_score ?? 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/reports" className="text-sm text-zinc-600 hover:text-zinc-900 font-medium">
            ← {t("reports.backToReports")}
          </Link>
          <Link
            href="/"
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            {t("reports.analyzeYours")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8 sm:space-y-10">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            {t(`reports.${meta.titleKey}`)}
          </h1>
        </div>

        {/* Positioning Score Gauge (first company) */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <PositioningScoreGauge
            score={score}
            companyUrl={firstCompany?.url}
          />
        </div>

        {/* Positioning Map — all companies, no gating */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">
            {t("results.map")}
          </h3>
          <PositioningMap
            companies={result.companies}
            axes={result.axes}
            userCompanyUrl={result.user_company_url}
          />
        </div>

        {/* Insights + Differentiation Score — no gating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <InsightCards
              insights={result.insights}
              title={t("results.insights")}
            />
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <DifferentiationScore
              companies={result.companies}
              userCompanyUrl={result.user_company_url}
              title={t("results.score")}
              description={t("results.scoreDescription")}
            />
          </div>
        </div>

        {/* 5-Second Test — all companies */}
        {firstCompany?.five_second_test && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <FiveSecondTest
              companies={result.companies}
              userCompanyUrl={result.user_company_url}
            />
          </div>
        )}

        {/* Health Detail — all companies, no gating */}
        {firstCompany?.positioning_health && (
          <PositioningHealthDetail
            companies={result.companies}
            userCompanyUrl={result.user_company_url}
          />
        )}

        {/* Red Flags — all companies */}
        {firstCompany?.red_flag_details != null && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <RedFlags
              companies={result.companies}
              userCompanyUrl={result.user_company_url}
            />
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">
              {t("results.recommendations")}
            </h3>
            <ul className="space-y-2 mt-3">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                  <span className="text-red-500 mt-0.5 shrink-0">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="text-center rounded-lg border-2 border-dashed border-zinc-300 p-8">
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            {t("reports.analyzeYours")}
          </h3>
          <Link
            href="/"
            className="inline-block mt-2 rounded-lg bg-red-600 px-6 py-3 text-white font-medium hover:bg-red-700 transition-colors"
          >
            {t("reports.analyzeYours")}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white mt-20">
        <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-zinc-400">
          <p>
            {t("footer.poweredBy")}{" "}
            <a
              href="https://meom.fi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-900"
            >
              {t("footer.meom")}
            </a>
          </p>
          <div className="flex items-center gap-3">
            <p>{t("footer.tagline")}</p>
            <span className="text-zinc-300">·</span>
            <Link href="/privacy" className="hover:text-zinc-600">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
