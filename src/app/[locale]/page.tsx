"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import UrlInput from "@/components/UrlInput";
import PositioningMap from "@/components/PositioningMap";
import InsightCards from "@/components/InsightCards";
import DifferentiationScore from "@/components/DifferentiationScore";
import LoadingState from "@/components/LoadingState";
import ContactCTA from "@/components/ContactCTA";
import FiveSecondTest from "@/components/FiveSecondTest";
import PositioningHealthScore from "@/components/PositioningHealthScore";
import PositioningHealthDetail from "@/components/PositioningHealthDetail";
import RedFlags from "@/components/RedFlags";
import EmailGate from "@/components/EmailGate";
import { PositioningResult } from "@/lib/types";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [result, setResult] = useState<PositioningResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loadingStage, setLoadingStage] = useState<
    "scraping" | "analyzing" | "generating"
  >("scraping");
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (data: {
    userUrl: string;
    competitorUrls: string[];
    industry: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsUnlocked(false);
    setLoadingStage("scraping");

    const stageTimer1 = setTimeout(() => setLoadingStage("analyzing"), 8000);
    const stageTimer2 = setTimeout(() => setLoadingStage("generating"), 20000);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_url: data.userUrl,
          competitor_urls: data.competitorUrls,
          industry: data.industry || undefined,
          locale,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Analysis failed");
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
      // Update browser URL to the unique results page (without full navigation)
      window.history.pushState(null, "", `/${locale}/results/${analysisResult.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setError(null);
    setIsUnlocked(false);
    router.push("/");
  };

  // Check if v2 data is present
  const hasV2Data = result?.companies?.[0]?.five_second_test != null;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-zinc-900 hover:text-zinc-700 transition-colors"
          >
            Positioning Radar
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              locale={locale === "en" ? "fi" : "en"}
              className="text-sm text-zinc-500 hover:text-zinc-700"
            >
              {locale === "en" ? "FI" : "EN"}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        {result ? (
          <div className="space-y-10">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900">
                {t("results.title")}
              </h2>
              <div className="flex items-center gap-4">
                <a
                  href={`/${locale}/results/${result.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const url = `${window.location.origin}/${locale}/results/${result.id}`;
                    navigator.clipboard.writeText(url);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="text-sm text-zinc-500 hover:text-zinc-700 underline"
                >
                  {linkCopied ? t("results.linkCopied") : t("results.copyLink")}
                </a>
                <button
                  onClick={handleNewAnalysis}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {t("results.newAnalysis")}
                </button>
              </div>
            </div>

            {/* Industry context */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="text-sm font-medium text-zinc-500 mb-1">
                {t("results.industryContext")}
              </h3>
              <p className="text-zinc-700">{result.industry_context}</p>
            </div>

            {/* Positioning Map */}
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

            {/* 3. 5 Second Test (v2 — FREE) */}
            {hasV2Data && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6">
                <FiveSecondTest
                  companies={result.companies}
                  userCompanyUrl={result.user_company_url}
                />
              </div>
            )}

            {/* 4+5. Health Score + Red Flags side by side (v2 — FREE) */}
            {hasV2Data && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.companies[0]?.positioning_health && (
                  <div className="rounded-lg border border-zinc-200 bg-white p-6">
                    <PositioningHealthScore
                      companies={result.companies}
                      userCompanyUrl={result.user_company_url}
                    />
                  </div>
                )}
                {result.companies[0]?.red_flag_details != null && (
                  <div className="rounded-lg border border-zinc-200 bg-white p-6">
                    <RedFlags
                      companies={result.companies}
                      userCompanyUrl={result.user_company_url}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 6. Insights + Differentiation Score */}
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

            {/* 7. Gating: EmailGate OR Gated content */}
            {hasV2Data && !isUnlocked && (
              <EmailGate
                analysisId={result.id}
                onUnlock={() => setIsUnlocked(true)}
              />
            )}

            {hasV2Data && isUnlocked && (
              <>
                {/* Gated: 6-element breakdown */}
                {result.companies[0]?.positioning_health && (
                  <div className="rounded-lg border border-zinc-200 bg-white p-6">
                    <PositioningHealthDetail
                      companies={result.companies}
                      userCompanyUrl={result.user_company_url}
                    />
                  </div>
                )}

                {/* Gated: Recommendations */}
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
              </>
            )}

            {/* 8. Contact CTA — leads to MEOM for deep analysis */}
            <ContactCTA analysisId={result.id} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 leading-tight">
                {t("hero.title")}
              </h2>
              <p className="text-lg text-zinc-500 max-w-xl mx-auto">
                {t("hero.subtitle")}
              </p>
            </div>

            {/* Loading or Form */}
            {isLoading ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-6">
                <LoadingState stage={loadingStage} />
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-white p-8">
                <UrlInput onSubmit={handleAnalyze} isLoading={isLoading} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white mt-20">
        <div className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-between text-sm text-zinc-400">
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
          <p>{t("footer.tagline")}</p>
        </div>
      </footer>
    </div>
  );
}
