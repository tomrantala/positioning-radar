"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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

export default function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const t = useTranslations("form");
  const [userUrl, setUserUrl] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState(["", ""]);
  const [industry, setIndustry] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addCompetitor = () => {
    if (competitorUrls.length < 5) {
      setCompetitorUrls([...competitorUrls, ""]);
    }
  };

  const removeCompetitor = (index: number) => {
    if (competitorUrls.length > 2) {
      setCompetitorUrls(competitorUrls.filter((_, i) => i !== index));
    }
  };

  const updateCompetitor = (index: number, value: string) => {
    const updated = [...competitorUrls];
    updated[index] = value;
    setCompetitorUrls(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!userUrl.trim() || !isValidUrl(userUrl)) {
      newErrors.userUrl = t("invalidUrl");
    }

    const filledCompetitors = competitorUrls.filter((u) => u.trim());
    if (filledCompetitors.length < 2) {
      newErrors.competitors = t("minCompetitors");
    }

    filledCompetitors.forEach((url, i) => {
      if (!isValidUrl(url)) {
        newErrors[`competitor_${i}`] = t("invalidUrl");
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      userUrl: normalizeUrl(userUrl),
      competitorUrls: filledCompetitors.map(normalizeUrl),
      industry: industry.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User URL */}
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

      {/* Competitor URLs */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t("competitorUrl")}
        </label>
        <div className="space-y-3">
          {competitorUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => updateCompetitor(i, e.target.value)}
                placeholder={t("competitorPlaceholder")}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                disabled={isLoading}
              />
              {competitorUrls.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeCompetitor(i)}
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
        {competitorUrls.length < 5 && (
          <button
            type="button"
            onClick={addCompetitor}
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

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-red-600 px-6 py-3.5 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? t("analyzing") : t("analyze")}
      </button>
    </form>
  );
}
