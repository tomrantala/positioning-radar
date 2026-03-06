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

function getElementBarColor(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export default function PositioningHealthDetail({
  companies,
  userCompanyUrl,
}: PositioningHealthDetailProps) {
  const t = useTranslations("healthDetail");

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-1">{t("title")}</h3>
      <p className="text-sm text-zinc-500 mb-4">{t("description")}</p>
      <div className="space-y-4">
        {companies.map((company) => {
          const isUser = company.url === userCompanyUrl;
          const health = company.positioning_health;
          if (!health) return null;

          return (
            <div
              key={company.url}
              className={`rounded-lg border p-4 ${
                isUser
                  ? "border-red-200 bg-red-50"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-sm font-semibold ${
                    isUser ? "text-red-700" : "text-zinc-800"
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
              <div className="space-y-2.5">
                {HEALTH_ELEMENTS.map((element) => {
                  const data = health[element];
                  if (!data) return null;

                  return (
                    <div key={element}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-zinc-600">
                          {t(element)}
                        </span>
                        <span className="text-xs font-bold text-zinc-700">
                          {data.score}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${getElementBarColor(data.score)}`}
                          style={{ width: `${data.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {data.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
