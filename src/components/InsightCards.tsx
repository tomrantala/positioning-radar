"use client";

interface InsightCardsProps {
  insights: string[];
  title: string;
}

export default function InsightCards({ insights, title }: InsightCardsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-3">{title}</h3>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm font-medium flex items-center justify-center">
              {i + 1}
            </span>
            <p className="text-sm text-zinc-700 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
