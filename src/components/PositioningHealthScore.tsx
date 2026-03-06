"use client";

import { CompanyAnalysis } from "@/lib/types";
import { useTranslations } from "next-intl";

interface PositioningHealthScoreProps {
  companies: CompanyAnalysis[];
  userCompanyUrl: string;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-500";
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export default function PositioningHealthScore({
  companies,
  userCompanyUrl,
}: PositioningHealthScoreProps) {
  const t = useTranslations("healthScore");

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-1">{t("title")}</h3>
      <p className="text-sm text-zinc-500 mb-4">{t("description")}</p>
      <div className="space-y-3">
        {companies.map((company) => {
          const isUser = company.url === userCompanyUrl;
          const health = company.positioning_health;
          if (!health) return null;

          return (
            <div
              key={company.url}
              className={`rounded-lg border p-3 ${
                isUser
                  ? "border-red-200 bg-red-50"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      isUser ? "text-red-700" : "text-zinc-700"
                    }`}
                  >
                    {company.name}
                  </span>
                  {isUser && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                      {t("you")}
                    </span>
                  )}
                </div>
                <span
                  className={`text-2xl font-bold ${getScoreColor(health.total_score)}`}
                >
                  {health.total_score}
                </span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${getScoreBarColor(health.total_score)}`}
                  style={{ width: `${health.total_score}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">
                {t("basedOn")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
