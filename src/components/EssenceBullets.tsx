"use client";

import type { MeltPhase } from "./TheMelt";
import type { NvcAnalysis, ConflictAnalysis } from "@/types/database";
import { isConflictAnalysis } from "@/types/database";

interface EssenceBulletsProps {
  analysis: NvcAnalysis | ConflictAnalysis;
  phase: MeltPhase;
  temperatureColor?: string;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  // Cut at last space before max, add ellipsis
  const cut = text.lastIndexOf(" ", max);
  return text.slice(0, cut > 0 ? cut : max) + "...";
}

export function EssenceBullets({
  analysis,
  phase,
  temperatureColor,
}: EssenceBulletsProps) {
  if (phase !== "crystallizing" && phase !== "settled") return null;

  const headline = isConflictAnalysis(analysis)
    ? analysis.meta.primaryInsight
    : analysis.subtext;

  const blindSpots = analysis.blindSpots?.slice(0, 2) ?? [];
  const needs = analysis.unmetNeeds?.slice(0, 3) ?? [];

  const animClass = phase === "crystallizing" ? "melt-crystallize-active" : "";

  return (
    <div className={animClass}>
      {headline && (
        <p className="text-foreground text-sm leading-snug font-semibold line-clamp-2">
          {truncate(headline, 120)}
        </p>
      )}

      {blindSpots.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {blindSpots.map((spot, i) => (
            <li key={`bs-${i}`} className="flex items-start gap-2 text-[13px] leading-snug">
              <span
                className="mt-[5px] block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: temperatureColor }}
              />
              <span className="text-ember-200 font-medium line-clamp-1">
                {truncate(spot, 90)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {needs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {needs.map((need, i) => (
            <span
              key={`need-${i}`}
              className="px-2 py-0.5 border border-border text-ember-300 font-mono text-[10px] uppercase tracking-wider rounded font-medium"
            >
              {need}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
