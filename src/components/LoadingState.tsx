"use client";

import { useTranslations } from "next-intl";

interface LoadingStateProps {
  stage: "scraping" | "analyzing" | "generating";
  current?: number;
  total?: number;
}

export default function LoadingState({
  stage,
  current,
  total,
}: LoadingStateProps) {
  const t = useTranslations("loading");

  const stages = ["scraping", "analyzing", "generating"] as const;
  const currentIndex = stages.indexOf(stage);

  return (
    <div className="flex flex-col items-center py-16">
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-200" />
        <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
      </div>

      {/* Stage message */}
      <p className="text-lg font-medium text-zinc-900 mb-2">
        {stage === "scraping" && current && total
          ? t("scrapingProgress", { current, total })
          : t(stage)}
      </p>
      <p className="text-sm text-zinc-400">{t("patience")}</p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {stages.map((s, i) => (
          <div
            key={s}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i <= currentIndex ? "bg-red-500" : "bg-zinc-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
