"use client";

import type { MeltPhase } from "./TheMelt";
import type { NvcAnalysis, ConflictAnalysis } from "@/types/database";
import { isConflictAnalysis } from "@/types/database";

interface EssenceBulletsProps {
  analysis: NvcAnalysis | ConflictAnalysis;
  phase: MeltPhase;
  temperatureColor?: string;
}

/**
 * Distilled essence of a message's analysis — replaces raw text
 * after The Melt dissolve, showing the structured meaning.
 *
 * Extracts from existing analysis fields:
 *  - Headline: meta.primaryInsight (V3) or subtext (V1)
 *  - Blind spot: first entry from blindSpots[]
 *  - Core needs: unmetNeeds[] as inline tags (max 3)
 */
export function EssenceBullets({
  analysis,
  phase,
  temperatureColor,
}: EssenceBulletsProps) {
  if (phase !== "crystallizing" && phase !== "settled") return null;

  const headline = isConflictAnalysis(analysis)
    ? analysis.meta.primaryInsight
    : analysis.subtext;

  const blindSpot = analysis.blindSpots?.[0] ?? null;
  const needs = analysis.unmetNeeds?.slice(0, 3) ?? [];

  const animClass = phase === "crystallizing" ? "melt-crystallize-active" : "";

  return (
    <div className={animClass}>
      {headline && (
        <div className="text-ember-300 text-sm leading-relaxed italic">
          {headline}
        </div>
      )}

      {blindSpot && (
        <div className="flex items-start gap-2 text-ember-400 text-sm mt-1">
          <span
            className="mt-1.5 block w-1 h-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: temperatureColor }}
          />
          <span>{blindSpot}</span>
        </div>
      )}

      {needs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {needs.map((need, i) => (
            <span
              key={i}
              className="px-2 py-0.5 border border-border text-ember-400 font-mono text-[10px] uppercase tracking-wider rounded"
            >
              {need}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
