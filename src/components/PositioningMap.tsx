"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  ReferenceLine,
  LabelList,
} from "recharts";
import { CompanyAnalysis, PositioningAxis } from "@/lib/types";

interface PositioningMapProps {
  companies: CompanyAnalysis[];
  axes: { x: PositioningAxis; y: PositioningAxis };
  userCompanyUrl: string;
}

function CompanyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CompanyAnalysis & { isUser: boolean } }>;
}) {
  if (!active || !payload?.length) return null;
  const company = payload[0].payload;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg max-w-xs">
      <p className="font-semibold text-zinc-900">{company.name}</p>
      <p className="text-xs text-zinc-500 mb-2">{company.url}</p>
      {company.key_messages.slice(0, 2).map((msg, i) => (
        <p key={i} className="text-sm text-zinc-600">
          {msg}
        </p>
      ))}
      <p className="text-xs text-zinc-400 mt-2">
        {company.target_audience}
      </p>
    </div>
  );
}

export default function PositioningMap({
  companies,
  axes,
  userCompanyUrl,
}: PositioningMapProps) {
  const userCompanies = companies
    .filter((c) => c.url === userCompanyUrl)
    .map((c) => ({ ...c, isUser: true }));

  const otherCompanies = companies
    .filter((c) => c.url !== userCompanyUrl)
    .map((c) => ({ ...c, isUser: false }));

  return (
    <div className="w-full">
      {/* Axis labels */}
      <div className="flex justify-between text-xs text-zinc-400 mb-1 px-4 sm:px-12">
        <span>{axes.y.high_label}</span>
      </div>

      <div className="h-[350px] sm:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="x_score"
            domain={[-100, 100]}
            tickCount={5}
            stroke="#a1a1aa"
            fontSize={11}
          >
            <Label
              value={axes.x.label}
              position="bottom"
              offset={15}
              style={{ fill: "#71717a", fontSize: 12 }}
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y_score"
            domain={[-100, 100]}
            tickCount={5}
            stroke="#a1a1aa"
            fontSize={11}
          >
            <Label
              value={axes.y.label}
              angle={-90}
              position="left"
              offset={5}
              style={{ fill: "#71717a", fontSize: 12 }}
            />
          </YAxis>
          <ReferenceLine x={0} stroke="#e4e4e7" />
          <ReferenceLine y={0} stroke="#e4e4e7" />
          <Tooltip
            content={<CompanyTooltip />}
            cursor={{ strokeDasharray: "3 3" }}
          />
          {/* Other companies */}
          <Scatter
            name="Competitors"
            data={otherCompanies}
            fill="#94a3b8"
            stroke="#64748b"
            strokeWidth={2}
            r={8}
          >
            <LabelList
              dataKey="name"
              position="bottom"
              offset={12}
              style={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
            />
          </Scatter>
          {/* User's company - highlighted */}
          <Scatter
            name="Your company"
            data={userCompanies}
            fill="#ef4444"
            stroke="#dc2626"
            strokeWidth={2}
            r={12}
          >
            <LabelList
              dataKey="name"
              position="bottom"
              offset={14}
              style={{ fill: "#dc2626", fontSize: 11, fontWeight: 600 }}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      </div>

      {/* Bottom axis labels */}
      <div className="flex justify-between text-xs text-zinc-400 px-4 sm:px-12 -mt-2">
        <span>{axes.x.low_label}</span>
        <span>{axes.x.high_label}</span>
      </div>
      <div className="flex justify-between text-xs text-zinc-400 mt-1 px-4 sm:px-12">
        <span>{axes.y.low_label}</span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Your company</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-400" />
          <span>Competitors</span>
        </div>
      </div>
    </div>
  );
}
