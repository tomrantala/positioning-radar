"use client";

import { CompanyAnalysis } from "@/lib/types";

interface DifferentiationScoreProps {
  companies: CompanyAnalysis[];
  userCompanyUrl: string;
  title: string;
  description: string;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-500";
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

export default function DifferentiationScore({
  companies,
  userCompanyUrl,
  title,
  description,
}: DifferentiationScoreProps) {
  const sorted = [...companies].sort(
    (a, b) => b.differentiation_index - a.differentiation_index
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 mb-4">{description}</p>
      <div className="space-y-3">
        {sorted.map((company) => {
          const isUser = company.url === userCompanyUrl;
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
                    className={`text-sm font-medium ${isUser ? "text-red-700" : "text-zinc-700"}`}
                  >
                    {company.name}
                  </span>
                  {isUser && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                      You
                    </span>
                  )}
                </div>
                <span
                  className={`text-lg font-bold ${getScoreColor(company.differentiation_index)}`}
                >
                  {company.differentiation_index}
                </span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getScoreBarColor(company.differentiation_index)}`}
                  style={{ width: `${company.differentiation_index}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1.5">
                {company.differentiation_summary}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
