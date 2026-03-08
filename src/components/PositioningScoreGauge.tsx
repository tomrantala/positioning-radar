"use client";

import { useTranslations } from "next-intl";

interface PositioningScoreGaugeProps {
  score: number;
  companyUrl?: string;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

function getScoreRating(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "needsWork";
  return "poor";
}

export default function PositioningScoreGauge({
  score,
  companyUrl,
}: PositioningScoreGaugeProps) {
  const t = useTranslations("v3");

  const color = getScoreColor(score);
  const rating = getScoreRating(score);

  // SVG arc geometry
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // semicircle
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center py-8">
      {/* SVG Gauge */}
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
          />
        </svg>

        {/* Score number centered */}
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <p className="text-5xl font-bold" style={{ color }}>
            {score}
          </p>
        </div>
      </div>

      {/* Rating label */}
      <p className="text-lg font-semibold mt-2" style={{ color }}>
        {t(rating)}
      </p>

      {/* Score label */}
      <p className="text-sm font-medium text-zinc-500 mt-1">
        {t("scoreLabel")}
      </p>

      {/* Company URL */}
      {companyUrl && (
        <a
          href={companyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-400 hover:text-zinc-600 underline mt-2 truncate max-w-xs"
        >
          {companyUrl}
        </a>
      )}
    </div>
  );
}
