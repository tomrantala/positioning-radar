"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import PositioningScoreGauge from "@/components/PositioningScoreGauge";
import FiveSecondTest from "@/components/FiveSecondTest";
import PositioningHealthDetail from "@/components/PositioningHealthDetail";
import RedFlags from "@/components/RedFlags";
import PositioningMap from "@/components/PositioningMap";
import InsightCards from "@/components/InsightCards";
import DifferentiationScore from "@/components/DifferentiationScore";
import ContactCTA from "@/components/ContactCTA";
import { PositioningResult } from "@/lib/types";
import { generateReport } from "@/lib/pdf-report";
import { saveToHistory } from "@/lib/analysis-history";
import AnalysisHistory from "@/components/AnalysisHistory";
import { Link } from "@/i18n/navigation";

export default function ResultsV3Page() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const id = params.id as string;
  const [result, setResult] = useState<PositioningResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [gateEmail, setGateEmail] = useState("");
  const [gateSubmitting, setGateSubmitting] = useState(false);

  useEffect(() => {
    async function fetchResult() {
      try {
        const response = await fetch(`/api/results/${id}`);
        if (!response.ok) throw new Error("Not found");
        const data = await response.json();
        setResult(data);
        saveToHistory({
          id: data.id,
          userUrl: data.user_company_url,
          industry: data.industry_context || null,
          createdAt: data.created_at || new Date().toISOString(),
          locale,
        });
      } catch {
        setError("Analysis not found");
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-red-500 animate-spin" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">{error || "Not found"}</p>
          <Link href="/" className="text-red-600 hover:text-red-700 font-medium">
            {t("results.newAnalysis")}
          </Link>
        </div>
      </div>
    );
  }

  // Extract user's company
  const userCompany =
    result.companies.find((c) => c.url === result.user_company_url) ||
    result.companies[0];

  const userScore = userCompany?.positioning_health?.total_score ?? 0;

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateEmail.trim()) return;
    setGateSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gateEmail.trim(),
          analysis_id: result.id,
          source: "v3_competitor_unlock",
        }),
      });
      setIsUnlocked(true);
    } catch {
      setIsUnlocked(true);
    } finally {
      setGateSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-2">
          <Link href="/" className="text-lg sm:text-xl font-bold text-zinc-900 shrink-0">
            Positioning Radar
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <AnalysisHistory variant="compact" currentId={id} />
            <button
              onClick={() => {
                if (!result) return;
                const doc = generateReport(result);
                doc.save(`positioning-report-${result.id}.pdf`);
              }}
              className="text-sm text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">PDF</span>
            </button>
            <Link
              href="/"
              className="text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
            >
              {t("results.newAnalysis")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8 sm:space-y-10">
        {/* Hero: Positioning Score Gauge */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-2">
            {t("v3.title")}
          </h2>
          <PositioningScoreGauge
            score={userScore}
            companyUrl={result.user_company_url}
          />
        </div>

        {/* 5-Second Test (user only) */}
        {userCompany?.five_second_test && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <FiveSecondTest
              companies={[userCompany]}
              userCompanyUrl={result.user_company_url}
            />
          </div>
        )}

        {/* Health Detail (user only — FREE in V3) */}
        {userCompany?.positioning_health && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <PositioningHealthDetail
              companies={[userCompany]}
              userCompanyUrl={result.user_company_url}
            />
          </div>
        )}

        {/* Red Flags (user only) */}
        {userCompany?.red_flag_details != null && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <RedFlags
              companies={[userCompany]}
              userCompanyUrl={result.user_company_url}
            />
          </div>
        )}

        {/* Recommendations (FREE in V3) */}
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

        {/* Email Gate for competitor content */}
        {!isUnlocked && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">{t("v3.gateTitle")}</h3>
              <p className="text-zinc-600 mb-4">{t("v3.gateDescription")}</p>

              <ul className="text-sm text-zinc-600 text-left space-y-1.5 mb-6 max-w-xs mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✓</span>
                  {t("v3.gateIncludes1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✓</span>
                  {t("v3.gateIncludes2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✓</span>
                  {t("v3.gateIncludes3")}
                </li>
              </ul>

              <form onSubmit={handleGateSubmit} className="space-y-3">
                <input
                  type="email"
                  value={gateEmail}
                  onChange={(e) => setGateEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={gateSubmitting}
                  className="w-full rounded-lg bg-red-600 px-6 py-3 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {t("v3.gateSubmit")}
                </button>
              </form>

              <p className="text-xs text-zinc-400 mt-3">{t("v3.gatePrivacy")}</p>
            </div>
          </div>
        )}

        {/* Gated: Competitor Content */}
        {isUnlocked && (
          <>
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
          </>
        )}

        {/* Contact CTA */}
        <ContactCTA analysisId={result.id} />
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
