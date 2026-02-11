"use client";

import { useState } from "react";
import type { LensId, LensResults } from "@/types/database";
import { LENS_METADATA } from "@/lib/context-modes";
import { LensDetailPanel } from "./LensDetailPanel";

interface LensBarProps {
  activeLenses: LensId[];
  lensResults: LensResults;
}

export function LensBar({ activeLenses, lensResults }: LensBarProps) {
  const [expandedLens, setExpandedLens] = useState<LensId | null>(null);

  // Filter to lenses that have actual results (non-null), excluding NVC (shown in root)
  const lensesWithResults = activeLenses.filter((id) => {
    if (id === "nvc") return false;
    return lensResults[id] != null;
  });

  if (lensesWithResults.length === 0) return null;

  return (
    <div>
      {/* Lens chips row */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {lensesWithResults.map((id) => {
          const meta = LENS_METADATA[id];
          const isExpanded = expandedLens === id;
          const categoryColor = getCategoryColor(meta.category);

          return (
            <button
              key={id}
              onClick={() => setExpandedLens(isExpanded ? null : id)}
              className={`flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider border rounded-sm transition-colors ${
                isExpanded
                  ? "border-accent/50 text-accent bg-accent/5"
                  : "border-border text-ember-500 hover:border-ember-600 hover:text-ember-300"
              }`}
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
