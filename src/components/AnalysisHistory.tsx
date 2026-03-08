"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getHistory, clearHistory, HistoryEntry } from "@/lib/analysis-history";

function formatUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface AnalysisHistoryProps {
  variant: "full" | "compact";
  currentId?: string;
}

export default function AnalysisHistory({ variant, currentId }: AnalysisHistoryProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (variant !== "compact" || !isOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [variant, isOpen]);

  const filtered = currentId ? entries.filter((e) => e.id !== currentId) : entries;

  if (filtered.length === 0) return null;

  const handleClear = () => {
    clearHistory();
    setEntries([]);
  };

  // Compact variant: dropdown in header nav
  if (variant === "compact") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">{t("history.title")}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-zinc-200 bg-white shadow-lg z-50">
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
              {filtered.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/results/${entry.id}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-zinc-50 transition"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 truncate">{formatUrl(entry.userUrl)}</p>
                    <p className="text-xs text-zinc-400">{timeAgo(entry.createdAt)}</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant: list on homepage
  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-zinc-500 mb-3">{t("history.title")}</h3>
      <div className="rounded-lg border border-zinc-200 bg-white divide-y divide-zinc-100">
        {filtered.map((entry) => (
          <Link
            key={entry.id}
            href={`/results/${entry.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{formatUrl(entry.userUrl)}</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {entry.industry && <span className="text-zinc-500">{entry.industry} · </span>}
                {timeAgo(entry.createdAt)}
              </p>
            </div>
            <svg className="w-4 h-4 text-zinc-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="mt-2 text-xs text-zinc-400 hover:text-zinc-600"
      >
        {t("history.clear")}
      </button>
    </div>
  );
}
