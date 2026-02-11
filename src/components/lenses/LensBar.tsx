"use client";

import { useState } from "react";
import type { LensId, LensResults } from "@/types/database";
import { LENS_METADATA } from "@/lib/context-modes";
import { LensDetailPanel } from "./LensDetailPanel";

interface LensBarProps {
  activeLenses: LensId[];
  lensResults: LensResults;
}

// Extract confidence from a lens result object (Claude returns it as a top-level field)
function getLensConfidence(result: unknown): number {
  if (result && typeof result === "object" && "confidence" in result) {
    const c = (result as Record<string, unknown>).confidence;
    return typeof c === "number" ? Math.max(0, Math.min(1, c)) : 0.5;
  }
  return 0.5; // default if Claude omits confidence
}

export function LensBar({ activeLenses, lensResults }: LensBarProps) {
  const [expandedLens, setExpandedLens] = useState<LensId | null>(null);

  // Filter to lenses that have actual results (non-null), excluding NVC (shown in root)
  const lensesWithResults = activeLenses
    .filter((id) => {
      if (id === "nvc") return false;
      return lensResults[id] != null;
    })
    .sort((a, b) => {
      // Sort by confidence descending — strongest signals first
      return getLensConfidence(lensResults[b]) - getLensConfidence(lensResults[a]);
    });

  if (lensesWithResults.length === 0) return null;

  return (
    <div>
      {/* Lens chips row — sorted by confidence, opacity reflects strength */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {lensesWithResults.map((id) => {
          const meta = LENS_METADATA[id];
          const isExpanded = expandedLens === id;
          const categoryColor = getCategoryColor(meta.category);
          const confidence = getLensConfidence(lensResults[id]);
          // Map confidence to opacity: 0.3 → 0.5 opacity, 1.0 → 1.0 opacity
          const chipOpacity = isExpanded ? 1 : 0.4 + confidence * 0.6;

          return (
            <button
              key={id}
              onClick={() => setExpandedLens(isExpanded ? null : id)}
              style={{ opacity: chipOpacity }}
              className={`flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider border rounded-sm transition-all ${
                isExpanded
                  ? "border-accent/50 text-accent bg-accent/5"
                  : "border-border text-ember-500 hover:border-ember-600 hover:text-ember-300"
              }`}
              title={`${meta.name} — ${Math.round(confidence * 100)}% confidence`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: categoryColor }}
              />
              {meta.shortName}
            </button>
          );
        })}
      </div>

      {/* Expanded lens detail */}
      {expandedLens && expandedLens !== "nvc" && lensResults[expandedLens] && (
        <LensDetailPanel
          lensId={expandedLens}
          result={lensResults[expandedLens] as Parameters<typeof LensDetailPanel>[0]["result"]}
          onClose={() => setExpandedLens(null)}
        />
      )}
    </div>
  );
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "communication":
      return "var(--temp-cool)";
    case "relational":
      return "var(--temp-warm)";
    case "cognitive":
      return "var(--temp-hot)";
    case "systemic":
      return "#8b7ec8"; // muted purple for systemic
    case "resolution":
      return "var(--temp-cool)";
    default:
      return "var(--ember-600)";
  }
}
