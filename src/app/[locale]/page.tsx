"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import UrlInput from "@/components/UrlInput";
import LoadingState from "@/components/LoadingState";
import { saveToHistory } from "@/lib/analysis-history";
import AnalysisHistory from "@/components/AnalysisHistory";
import { REPORTS } from "@/lib/reports-data";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<
    "scraping" | "analyzing" | "generating"
  >("scraping");
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const handleLoadingEmail = async (email: string) => {
    setLoadingEmail(email);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          analysis_id: null,
          source: "loading_email_results",
        }),
      });
    } catch {
      // Graceful fail — still show confirmation
    }
    setEmailSent(true);
  };

  const handleAnalyze = async (data: {
    userUrl: string;
    competitorUrls: string[];
    industry: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setLoadingStage("scraping");
    setEmailSent(false);

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
      // Save to browser history
      saveToHistory({
        id: analysisResult.id,
        userUrl: analysisResult.user_company_url,
        industry: analysisResult.industry_context || null,
        createdAt: analysisResult.created_at || new Date().toISOString(),
        locale,
      });

      // If user submitted email during loading, send results email
      if (loadingEmail) {
        fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: loadingEmail,
            analysis_id: analysisResult.id,
            source: "loading_results_ready",
          }),
        }).catch(() => {});
      }

      // Navigate to the actual results page (single source of truth for results UI)
      router.push(`/results/${analysisResult.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
    }
  };

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
              <LoadingState
                stage={loadingStage}
                onEmailSubmit={handleLoadingEmail}
                emailSent={emailSent}
              />
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-zinc-200 bg-white p-8">
                <UrlInput onSubmit={handleAnalyze} isLoading={isLoading} />
              </div>
              <p className="mt-3 text-center text-xs text-zinc-400">
                {t("privacy.notice")}{" "}
                <Link href="/privacy" className="underline hover:text-zinc-600">
                  {t("privacy.link")}
                </Link>
              </p>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Previous analyses */}
          {!isLoading && <AnalysisHistory variant="full" />}
        </div>

        {/* Reports section */}
        {!isLoading && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">
                {t("reports.title")}
              </h3>
              <p className="text-sm text-zinc-500 max-w-lg mx-auto">
                {t("reports.subtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {REPORTS.map((report) => (
                <Link
                  key={report.slug}
                  href={`/reports/${report.slug}`}
                  className="group rounded-lg border border-zinc-200 bg-white p-5 hover:border-red-300 hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-2">{report.emoji}</div>
                  <h4 className="text-base font-semibold text-zinc-900 group-hover:text-red-600 transition-colors mb-1">
                    {t(`reports.${report.titleKey}`)}
                  </h4>
                  <p className="text-sm text-zinc-500 mb-3 line-clamp-2">
                    {t(`reports.${report.descriptionKey}`)}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {report.companies.map((company) => (
                      <span
                        key={company}
                        className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-red-600 font-medium group-hover:text-red-700">
                    {t("reports.viewReport")} →
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-5">
              <Link
                href="/reports"
                className="text-sm text-zinc-500 hover:text-red-600 font-medium transition-colors"
              >
                {t("reports.viewAll")} →
              </Link>
            </div>
          </div>
        )}
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
