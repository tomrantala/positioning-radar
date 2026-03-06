"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import UrlInput from "@/components/UrlInput";
import PositioningMap from "@/components/PositioningMap";
import InsightCards from "@/components/InsightCards";
import DifferentiationScore from "@/components/DifferentiationScore";
import LoadingState from "@/components/LoadingState";
import { PositioningResult } from "@/lib/types";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [result, setResult] = useState<PositioningResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    setLoadingStage("scraping");

    // Simulate stage progression
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
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">
            Positioning Radar
          </h1>
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
        {/* Show results or input form */}
        {result ? (
          <div className="space-y-10">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900">
                {t("results.title")}
              </h2>
              <button
                onClick={handleNewAnalysis}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                {t("results.newAnalysis")}
              </button>
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

            {/* Two-column: Insights + Score */}
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

            {/* Recommendations */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <InsightCards
                insights={result.recommendations}
                title={t("results.recommendations")}
              />
            </div>

            {/* Email gate CTA */}
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8 text-center">
              <h3 className="text-xl font-bold text-zinc-900 mb-2">
                {t("results.fullReport")}
              </h3>
              <p className="text-zinc-600 mb-6 max-w-md mx-auto">
                {t("results.fullReportDescription")}
              </p>
              <button className="rounded-lg bg-red-600 px-8 py-3 text-white font-medium hover:bg-red-700 transition-colors">
                {t("results.getFullReport")}
              </button>
            </div>
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
