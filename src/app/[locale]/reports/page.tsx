"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { REPORTS } from "@/lib/reports-data";

export default function ReportsPage() {
  const t = useTranslations("reports");

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-zinc-900">
            Positioning Radar
          </Link>
          <Link
            href="/"
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            {t("analyzeYours")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3">
            {t("title")}
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Report cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {REPORTS.map((report) => (
            <Link
              key={report.slug}
              href={`/reports/${report.slug}`}
              className="group rounded-lg border border-zinc-200 bg-white p-6 hover:border-red-300 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-3">{report.emoji}</div>
              <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-red-600 transition-colors mb-2">
                {t(report.titleKey)}
              </h2>
              <p className="text-sm text-zinc-500 mb-4">
                {t(report.descriptionKey)}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
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
                {t("viewReport")} →
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center rounded-lg border-2 border-dashed border-zinc-300 p-8">
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            🎯 {t("analyzeYours")}
          </h3>
          <Link
            href="/"
            className="inline-block mt-2 rounded-lg bg-red-600 px-6 py-3 text-white font-medium hover:bg-red-700 transition-colors"
          >
            {t("analyzeYours")}
          </Link>
        </div>
      </main>
    </div>
  );
}
