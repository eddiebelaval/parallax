"use client";

import { getTemperatureColor, getTemperatureLabel } from "@/lib/temperature";
import type { NvcAnalysis, ConflictAnalysis } from "@/types/database";
import { isConflictAnalysis } from "@/types/database";

interface SignalCardProps {
  analysis: NvcAnalysis | ConflictAnalysis;
  side: "left" | "right";
}

const DIRECTION_SYMBOL: Record<string, string> = {
  escalating: "^",
  stable: "-",
  "de-escalating": "v",
};

export function SignalCard({ analysis, side }: SignalCardProps) {
  const temp = analysis.emotionalTemperature ?? 0;
  const color = getTemperatureColor(temp);
  const label = getTemperatureLabel(temp).toUpperCase();

  // V3: use primaryInsight if available, fall back to V1 subtext
  const insight = isConflictAnalysis(analysis)
    ? analysis.meta.primaryInsight
    : analysis.subtext;

  const direction = isConflictAnalysis(analysis)
    ? DIRECTION_SYMBOL[analysis.meta.resolutionDirection] || "-"
    : "-";

  // Show max 3 unmet needs as compact tags
  const needs = analysis.unmetNeeds?.slice(0, 3) || [];

  const borderClass =
    side === "left" ? "border-l-2" : "border-r-2";

  return (
    <div
      className={`signal-card-enter px-2 py-1.5 ${borderClass}`}
      style={{ borderColor: color }}
    >
      {/* Temperature indicator */}
      <div className="flex items-center gap-1.5 mb-0.5">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span
          className="font-mono text-[9px] tracking-widest"
          style={{ color }}
        >
          {label}
        </span>
        <span
          className="font-mono text-[9px]"
          style={{ color }}
        >
          {direction}
        </span>
      </div>

      {/* Primary insight */}
      {insight && (
        <p className="text-ember-400 text-[11px] leading-tight line-clamp-2">
          {insight}
        </p>
      )}

      {/* First blind spot — keeps signal rail in sync with essence format */}
      {analysis.blindSpots?.[0] && (
        <p className="text-ember-500 text-[10px] leading-tight mt-0.5 line-clamp-1">
          {analysis.blindSpots[0]}
        </p>
      )}

      {/* Unmet needs tags */}
      {needs.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {needs.map((need) => (
            <span
              key={need}
              className="font-mono text-[8px] uppercase tracking-wider text-ember-500 px-1 py-0.5 border border-ember-800 rounded-sm"
            >
              {need}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
