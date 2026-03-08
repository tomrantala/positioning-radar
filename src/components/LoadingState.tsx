"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface LoadingStateProps {
  stage: "scraping" | "analyzing" | "generating";
  current?: number;
  total?: number;
  onEmailSubmit?: (email: string) => void;
  emailSent?: boolean;
}

const EMAIL_DELAY_MS = 15000;

export default function LoadingState({
  stage,
  current,
  total,
  onEmailSubmit,
  emailSent,
}: LoadingStateProps) {
  const t = useTranslations("loading");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");

  const stages = ["scraping", "analyzing", "generating"] as const;
  const currentIndex = stages.indexOf(stage);

  useEffect(() => {
    if (!onEmailSubmit) return;
    const timer = setTimeout(() => setShowEmailForm(true), EMAIL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onEmailSubmit]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !onEmailSubmit) return;
    onEmailSubmit(email.trim());
  };

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

      {/* Email sent confirmation */}
      {onEmailSubmit && emailSent && (
        <div className="mt-8 text-center">
          <p className="text-sm text-green-600 font-medium">
            {t("emailSent")}
          </p>
        </div>
      )}

      {/* Email form — appears after delay */}
      {onEmailSubmit && showEmailForm && !emailSent && (
        <div className="mt-8 w-full max-w-sm animate-in fade-in duration-500">
          <p className="text-sm text-zinc-500 text-center mb-3">
            {t("emailPrompt")}
          </p>
          <form onSubmit={handleEmailSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              required
              className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              {t("emailSubmit")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
