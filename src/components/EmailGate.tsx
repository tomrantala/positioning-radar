"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface EmailGateProps {
  analysisId: string;
  onUnlock: () => void;
}

export default function EmailGate({ analysisId, onUnlock }: EmailGateProps) {
  const t = useTranslations("emailGate");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          analysis_id: analysisId,
          source: "positioning_health_detail",
        }),
      });
      onUnlock();
    } catch {
      // Still unlock — don't block UX on network failures
      onUnlock();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">{t("title")}</h3>
        <p className="text-zinc-600 mb-4">{t("description")}</p>

        <ul className="text-sm text-zinc-600 text-left space-y-1.5 mb-6 max-w-xs mx-auto">
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✓</span>
            {t("includes1")}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✓</span>
            {t("includes2")}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✓</span>
            {t("includes3")}
          </li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
            className="w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-red-600 px-6 py-3 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? t("sending") : t("submit")}
          </button>
        </form>

        <p className="text-xs text-zinc-400 mt-3">{t("privacy")}</p>
      </div>
    </div>
  );
}
