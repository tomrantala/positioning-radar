"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ContactCTAProps {
  analysisId: string;
}

export default function ContactCTA({ analysisId }: ContactCTAProps) {
  const t = useTranslations("cta");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
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
          source: "deep_analysis_request",
        }),
      });
      setSubmitted(true);
    } catch {
      // Still show success — we don't want to block the UX
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-zinc-900 mb-1">
          {t("thankYou")}
        </h3>
        <p className="text-zinc-600">{t("thankYouDescription")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8">
      <div className="max-w-lg mx-auto text-center">
        <h3 className="text-xl font-bold text-zinc-900 mb-2">{t("title")}</h3>
        <p className="text-zinc-600 mb-6">{t("description")}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
          />
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
