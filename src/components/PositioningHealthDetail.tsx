"use client";

import { CompanyAnalysis } from "@/lib/types";
import { useTranslations } from "next-intl";

interface PositioningHealthDetailProps {
  companies: CompanyAnalysis[];
  userCompanyUrl: string;
}

const HEALTH_ELEMENTS = [
  "best_customers",
  "competitive_alternatives",
  "unique_attributes",
  "value_creators",
  "category",
  "unique_value_propositions",
] as const;

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

function getBarColor(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

function getRingColor(score: number): string {
  if (score >= 70) return "ring-green-200 bg-green-50";
  if (score >= 50) return "ring-yellow-200 bg-yellow-50";
  return "ring-red-200 bg-red-50";
}

export default function PositioningHealthDetail({
  companies,
  userCompanyUrl,
}: PositioningHealthDetailProps) {
  const t = useTranslations("healthDetail");

  // Merge health data from all companies (for user-only view, there's just 1)
  const userCompany = companies.find((c) => c.url === userCompanyUrl) || companies[0];
  const health = userCompany?.positioning_health;
  if (!health) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-1">{t("title")}</h3>
      <p className="text-sm text-zinc-500 mb-5">{t("description")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HEALTH_ELEMENTS.map((element) => {
          const data = health[element];
          if (!data) return null;

          return (
            <div
              key={element}
              data-testid="health-element-card"
              className={`rounded-lg border border-zinc-200 p-4 ring-1 ${getRingColor(data.score)}`}
            >
              {/* Score + Label header */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-zinc-800">
                  {t(element)}
                </h4>
                <span className={`text-xl font-bold tabular-nums ${getScoreColor(data.score)}`}>
                  {data.score}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-100 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${getBarColor(data.score)}`}
                  style={{ width: `${data.score}%` }}
                />
              </div>

              {/* Summary */}
              <p className="text-xs text-zinc-600 leading-relaxed">
                {data.summary}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
