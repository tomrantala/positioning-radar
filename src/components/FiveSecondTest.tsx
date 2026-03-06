"use client";

import { CompanyAnalysis } from "@/lib/types";
import { useTranslations } from "next-intl";

interface FiveSecondTestProps {
  companies: CompanyAnalysis[];
  userCompanyUrl: string;
}

function getResultBadge(
  result: "pass" | "partial" | "fail",
  t: (key: string) => string
) {
  switch (result) {
    case "pass":
      return {
        label: t("pass"),
        className: "bg-green-100 text-green-700 border-green-200",
      };
    case "partial":
      return {
        label: t("partial"),
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      };
    case "fail":
      return {
        label: t("fail"),
        className: "bg-red-100 text-red-700 border-red-200",
      };
  }
}

export default function FiveSecondTest({
  companies,
  userCompanyUrl,
}: FiveSecondTestProps) {
  const t = useTranslations("fiveSecondTest");

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-1">{t("title")}</h3>
      <p className="text-sm text-zinc-500 mb-4">{t("description")}</p>
      <div className="space-y-3">
        {companies.map((company) => {
          const isUser = company.url === userCompanyUrl;
          const test = company.five_second_test;
          if (!test) return null;

          const badge = getResultBadge(test.result, t);

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
                  className={`text-xs font-semibold px-2 py-1 rounded border ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-sm text-zinc-600 mb-1">
                <span className="font-medium text-zinc-700">
                  {t("understands")}:
                </span>{" "}
                {test.what_visitor_understands}
              </p>
              {test.what_is_unclear && (
                <p className="text-sm text-zinc-500">
                  <span className="font-medium text-zinc-600">
                    {t("unclear")}:
                  </span>{" "}
                  {test.what_is_unclear}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
