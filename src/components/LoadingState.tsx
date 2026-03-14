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
const SUB_MESSAGE_INTERVAL_MS = 4000;
const ELAPSED_INTERVAL_MS = 1000;
const FACT_INTERVAL_MS = 8000;
const ESTIMATED_TOTAL_SECONDS = 90;

const stages = ["scraping", "analyzing", "generating"] as const;

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
  const [subMessageIndex, setSubMessageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  const currentIndex = stages.indexOf(stage);

  // Email form delay
  useEffect(() => {
    if (!onEmailSubmit) return;
    const timer = setTimeout(() => setShowEmailForm(true), EMAIL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onEmailSubmit]);

  // Rotating sub-messages — reset index when stage changes
  useEffect(() => {
    setSubMessageIndex(0);
  }, [stage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSubMessageIndex((prev) => (prev + 1) % 3);
    }, SUB_MESSAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [stage]);

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, ELAPSED_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // Rotating facts
  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % 4);
    }, FACT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !onEmailSubmit) return;
    onEmailSubmit(email.trim());
  };

  // Sub-message for current stage
  const subKeys = [`${stage}_sub1`, `${stage}_sub2`, `${stage}_sub3`];
  const currentSubMessage = t(subKeys[subMessageIndex]);

  // Fact keys
  const factKeys = ["fact1", "fact2", "fact3", "fact4"];
  const currentFact = t(factKeys[factIndex]);

  // Progress bar: 0-100 based on stage + elapsed time within stage
  const stageProgress = (currentIndex / stages.length) * 100;
  const stageWidth = 100 / stages.length;
  // Animate within current stage based on time
  const withinStageProgress = Math.min(
    (elapsedSeconds / ESTIMATED_TOTAL_SECONDS) * 100,
    95
  );
  const progressPercent = Math.max(stageProgress, withinStageProgress);

  // Estimated remaining
  const remainingSeconds = Math.max(
    ESTIMATED_TOTAL_SECONDS - elapsedSeconds,
    0
  );

  return (
    <div className="flex flex-col items-center py-16">
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-200" />
        <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
      </div>

      {/* Stage message */}
      <p className="text-lg font-medium text-zinc-900 mb-1">
        {stage === "scraping" && current && total
          ? t("scrapingProgress", { current, total })
          : t(stage)}
      </p>

      {/* Rotating sub-message */}
      <p className="text-sm text-zinc-500 mb-2 transition-opacity duration-300">
        {currentSubMessage}
      </p>

      {/* Step counter */}
      <p className="text-xs text-zinc-400 mb-1">
        {t("step", { current: currentIndex + 1, total: stages.length })}
      </p>

      {/* Patience text */}
      <p className="text-sm text-zinc-400">{t("patience")}</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs mt-6">
        <div
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Elapsed + Estimated */}
      <div className="flex gap-4 mt-3 text-xs text-zinc-400">
        <span>{t("elapsed", { seconds: elapsedSeconds })}</span>
        <span>·</span>
        <span>{t("estimatedRemaining", { seconds: remainingSeconds })}</span>
      </div>

      {/* Did you know? fact */}
      <div className="mt-6 max-w-sm text-center">
        <p className="text-xs text-zinc-400 italic transition-opacity duration-500">
          💡 {currentFact}
        </p>
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
