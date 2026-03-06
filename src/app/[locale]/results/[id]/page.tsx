"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PositioningMap from "@/components/PositioningMap";
import InsightCards from "@/components/InsightCards";
import DifferentiationScore from "@/components/DifferentiationScore";
import ContactCTA from "@/components/ContactCTA";
import FiveSecondTest from "@/components/FiveSecondTest";
import PositioningHealthScore from "@/components/PositioningHealthScore";
import PositioningHealthDetail from "@/components/PositioningHealthDetail";
import RedFlags from "@/components/RedFlags";
import EmailGate from "@/components/EmailGate";
import { PositioningResult } from "@/lib/types";
import { Link } from "@/i18n/navigation";

export default function ResultsPage() {
  const t = useTranslations();
  const params = useParams();
  const id = params.id as string;
  const [result, setResult] = useState<PositioningResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    async function fetchResult() {
      try {
        const response = await fetch(`/api/results/${id}`);
        if (!response.ok) throw new Error("Not found");
        const data = await response.json();
        setResult(data);
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

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-zinc-900">
            Positioning Radar
          </Link>
          <Link
            href="/"
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            {t("results.newAnalysis")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 space-y-10">
        <h2 className="text-2xl font-bold text-zinc-900">
          {t("results.title")}
        </h2>

        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h3 className="text-sm font-medium text-zinc-500 mb-1">
            {t("results.industryContext")}
          </h3>
          <p className="text-zinc-700">{result.industry_context}</p>
        </div>

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

        {/* 5 Second Test (v2 — FREE) */}
        {result.companies[0]?.five_second_test && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <FiveSecondTest
              companies={result.companies}
              userCompanyUrl={result.user_company_url}
            />
          </div>
        )}

        {/* Health Score + Red Flags side by side (v2 — FREE) */}
        {result.companies[0]?.five_second_test && (
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

        {/* Insights + Differentiation Score */}
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

        {/* Gating: EmailGate OR Gated content */}
        {result.companies[0]?.five_second_test && !isUnlocked && (
          <EmailGate
            analysisId={result.id}
            onUnlock={() => setIsUnlocked(true)}
          />
        )}

        {result.companies[0]?.five_second_test && isUnlocked && (
          <>
            {result.companies[0]?.positioning_health && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6">
                <PositioningHealthDetail
                  companies={result.companies}
                  userCompanyUrl={result.user_company_url}
                />
              </div>
            )}

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

        {/* Contact CTA */}
        <ContactCTA analysisId={result.id} />
      </main>

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
