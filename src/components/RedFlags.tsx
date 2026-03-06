"use client";

import { useState } from "react";
import { CompanyAnalysis, RedFlagType } from "@/lib/types";
import { useTranslations } from "next-intl";

interface RedFlagsProps {
  companies: CompanyAnalysis[];
  userCompanyUrl: string;
}

const FLAG_COLORS: Record<RedFlagType, string> = {
  generic_terminology: "bg-orange-100 text-orange-700 border-orange-200",
  self_focused_language: "bg-purple-100 text-purple-700 border-purple-200",
  missing_pain_points: "bg-red-100 text-red-700 border-red-200",
  buzzword_overload: "bg-amber-100 text-amber-700 border-amber-200",
  interchangeable_messaging: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function RedFlags({
  companies,
  userCompanyUrl,
}: RedFlagsProps) {
  const t = useTranslations("redFlags");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-1">{t("title")}</h3>
      <p className="text-sm text-zinc-500 mb-4">{t("description")}</p>
      <div className="space-y-3">
        {companies.map((company) => {
          const isUser = company.url === userCompanyUrl;
          const flags = company.red_flag_details;
          const hasFlags = flags && flags.length > 0;

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
                {!hasFlags && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded">
                    {t("noFlags")}
                  </span>
                )}
              </div>

              {hasFlags && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {flags.map((flag, i) => {
                    const colorClass =
                      FLAG_COLORS[flag.type] ||
                      "bg-zinc-100 text-zinc-700 border-zinc-200";
                    const expandKey = `${company.url}-${i}`;
                    const isExpanded = expanded[expandKey];

                    return (
                      <div key={i} className="w-full">
                        <button
                          onClick={() => toggleExpand(expandKey)}
                          className={`text-xs font-medium px-2 py-1 rounded border cursor-pointer transition-colors hover:opacity-80 ${colorClass}`}
                        >
                          {t(flag.type)}
                          <span className="ml-1">{isExpanded ? "▲" : "▼"}</span>
                        </button>
                        {isExpanded && (
                          <div className="mt-1.5 ml-2 pl-2 border-l-2 border-zinc-200 text-xs space-y-1">
                            <p className="text-zinc-600">
                              <span className="font-medium">{t("example")}:</span>{" "}
                              &ldquo;{flag.example}&rdquo;
                            </p>
                            <p className="text-zinc-500">
                              <span className="font-medium">{t("suggestion")}:</span>{" "}
                              {flag.suggestion}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
