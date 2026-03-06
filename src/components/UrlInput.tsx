"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

interface CompetitorSuggestion {
  name: string;
  url: string;
  description: string;
}

interface UrlInputProps {
  onSubmit: (data: {
    userUrl: string;
    competitorUrls: string[];
    industry: string;
  }) => void;
  isLoading: boolean;
}

function isValidUrl(str: string): boolean {
  try {
    const url = str.startsWith("http") ? str : `https://${str}`;
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function normalizeUrl(str: string): string {
  const trimmed = str.trim();
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

type Step = "url" | "competitors" | "manual";

export default function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const t = useTranslations("form");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("url");
  const [userUrl, setUserUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [detectedIndustry, setDetectedIndustry] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Suggested competitors (from auto-discovery)
  const [suggestions, setSuggestions] = useState<CompetitorSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(
    new Set()
  );

  // Manual competitor URLs
  const [manualUrls, setManualUrls] = useState(["", ""]);

  const [isFinding, setIsFinding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: Find competitors automatically
  const handleFindCompetitors = async () => {
    if (!userUrl.trim() || !isValidUrl(userUrl)) {
      setErrors({ userUrl: t("invalidUrl") });
      return;
    }
    setErrors({});
    setIsFinding(true);

    try {
      const response = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizeUrl(userUrl), locale }),
      });

      if (!response.ok) throw new Error("Failed to find competitors");

      const data = await response.json();
      setSuggestions(data.competitors);
      setDetectedIndustry(data.detected_industry);
      setCompanyName(data.company_name);
      setSelectedSuggestions(
        new Set(data.competitors.map((_: unknown, i: number) => i))
      );
      setStep("competitors");
    } catch (err) {
      // Show error and let user retry or go manual
      console.error("Competitor discovery failed:", err);
      setErrors({
        competitors: t("competitorDiscoveryFailed"),
      });
    } finally {
      setIsFinding(false);
    }
  };

  // Toggle competitor selection
  const toggleSuggestion = (index: number) => {
    const updated = new Set(selectedSuggestions);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setSelectedSuggestions(updated);
  };

  // Submit with selected suggestions
  const handleSubmitSuggestions = () => {
    const selectedUrls = suggestions
      .filter((_, i) => selectedSuggestions.has(i))
      .map((s) => s.url);

    if (selectedUrls.length < 2) {
      setErrors({ competitors: t("minCompetitors") });
      return;
    }

    onSubmit({
      userUrl: normalizeUrl(userUrl),
      competitorUrls: selectedUrls,
      industry: detectedIndustry,
    });
  };

  // Manual competitor entry
  const addManualUrl = () => {
    if (manualUrls.length < 5) setManualUrls([...manualUrls, ""]);
  };
  const removeManualUrl = (i: number) => {
    if (manualUrls.length > 2) setManualUrls(manualUrls.filter((_, j) => j !== i));
  };
  const updateManualUrl = (i: number, val: string) => {
    const updated = [...manualUrls];
    updated[i] = val;
    setManualUrls(updated);
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!userUrl.trim() || !isValidUrl(userUrl)) {
      newErrors.userUrl = t("invalidUrl");
    }

    const filled = manualUrls.filter((u) => u.trim());
    if (filled.length < 2) {
      newErrors.competitors = t("minCompetitors");
    }
    filled.forEach((url, i) => {
      if (!isValidUrl(url)) newErrors[`competitor_${i}`] = t("invalidUrl");
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      userUrl: normalizeUrl(userUrl),
      competitorUrls: filled.map(normalizeUrl),
      industry: industry.trim(),
    });
  };

  // ─── Step 1: Enter URL ───
  if (step === "url") {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            {t("yourUrl")}
          </label>
          <input
            type="text"
            value={userUrl}
            onChange={(e) => setUserUrl(e.target.value)}
            placeholder={t("yourUrlPlaceholder")}
            className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
            disabled={isFinding}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleFindCompetitors();
              }
            }}
          />
          {errors.userUrl && (
            <p className="mt-1 text-sm text-red-500">{errors.userUrl}</p>
          )}
        </div>

        <button
          onClick={handleFindCompetitors}
          disabled={isFinding}
          className="w-full rounded-lg bg-red-600 px-6 py-3.5 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFinding ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              {t("findingCompetitors")}
            </span>
          ) : (
            t("findCompetitors")
          )}
        </button>

        {errors.competitors && (
          <p className="text-sm text-red-500 text-center">{errors.competitors}</p>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-zinc-400">{t("or")}</span>
          </div>
        </div>

        <button
          onClick={() => setStep("manual")}
          className="w-full rounded-lg border border-zinc-300 px-6 py-3 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors"
        >
          {t("enterManually")}
        </button>
      </div>
    );
  }

  // ─── Step 2: Competitor suggestions ───
  if (step === "competitors") {
    const selectedCount = selectedSuggestions.size;

    return (
      <div className="space-y-6">
        {/* Company detection */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">{t("detected")}</p>
          <p className="font-medium text-zinc-900">{companyName}</p>
          <p className="text-sm text-zinc-500 mt-1">
            {t("detectedIndustry")}: {detectedIndustry}
          </p>
        </div>

        {/* Competitor list */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-3">
            {t("suggestedCompetitors")} ({selectedCount} {t("selected")})
          </label>
          <div className="space-y-2">
            {suggestions.map((comp, i) => {
              const isSelected = selectedSuggestions.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleSuggestion(i)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? "border-red-300 bg-red-50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "border-red-500 bg-red-500"
                          : "border-zinc-300"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900">{comp.name}</p>
                      <p className="text-xs text-zinc-400 truncate">
                        {comp.url}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">
                        {comp.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.competitors && (
            <p className="mt-2 text-sm text-red-500">{errors.competitors}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setStep("url")}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors"
          >
            {t("back")}
          </button>
          <button
            onClick={handleSubmitSuggestions}
            disabled={isLoading || selectedCount < 2}
            className="flex-[2] rounded-lg bg-red-600 px-6 py-3 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("analyzing") : t("analyzeSelected")}
          </button>
        </div>
      </div>
    );
  }

  // ─── Manual mode ───
  return (
    <form onSubmit={handleSubmitManual} className="space-y-6">
      {/* User URL (pre-filled if coming from step 1) */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t("yourUrl")}
        </label>
        <input
          type="text"
          value={userUrl}
          onChange={(e) => setUserUrl(e.target.value)}
          placeholder={t("yourUrlPlaceholder")}
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
          disabled={isLoading}
        />
        {errors.userUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.userUrl}</p>
        )}
      </div>

      {/* Manual competitor URLs */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t("competitorUrl")}
        </label>
        <div className="space-y-3">
          {manualUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => updateManualUrl(i, e.target.value)}
                placeholder={t("competitorPlaceholder")}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                disabled={isLoading}
              />
              {manualUrls.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeManualUrl(i)}
                  className="px-3 py-2 text-sm text-zinc-400 hover:text-red-500 transition-colors"
                  disabled={isLoading}
                >
                  {t("removeCompetitor")}
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.competitors && (
          <p className="mt-1 text-sm text-red-500">{errors.competitors}</p>
        )}
        {manualUrls.length < 5 && (
          <button
            type="button"
            onClick={addManualUrl}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
            disabled={isLoading}
          >
            + {t("addCompetitor")}
          </button>
        )}
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t("industry")}
        </label>
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder={t("industryPlaceholder")}
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-zinc-400">{t("industryHint")}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep("url")}
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors"
        >
          {t("back")}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-[2] rounded-lg bg-red-600 px-6 py-3.5 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t("analyzing") : t("analyze")}
        </button>
      </div>
    </form>
  );
}
