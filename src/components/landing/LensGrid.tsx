"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LENS_METADATA,
  CONTEXT_MODE_LENSES,
  CONTEXT_MODE_INFO,
} from "@/lib/context-modes";
import type { ContextMode, LensId } from "@/types/database";

const CONTEXT_MODES: ContextMode[] = [
  "intimate",
  "family",
  "professional_peer",
  "professional_hierarchical",
  "transactional",
  "civil_structural",
];

const CYCLE_INTERVAL_MS = 3000;

type LensCategory =
  | "communication"
  | "relational"
  | "cognitive"
  | "systemic"
  | "resolution";

const CATEGORY_ORDER: LensCategory[] = [
  "communication",
  "relational",
  "cognitive",
  "systemic",
  "resolution",
];

const CATEGORY_LABELS: Record<LensCategory, string> = {
  communication: "Communication",
  relational: "Relational",
  cognitive: "Cognitive",
  systemic: "Systemic",
  resolution: "Resolution",
};

// Group lenses by category
function getLensesByCategory(): Record<LensCategory, LensId[]> {
  const groups: Record<LensCategory, LensId[]> = {
    communication: [],
    relational: [],
    cognitive: [],
    systemic: [],
    resolution: [],
  };

  for (const [id, meta] of Object.entries(LENS_METADATA)) {
    groups[meta.category].push(id as LensId);
  }

  return groups;
}

const LENSES_BY_CATEGORY = getLensesByCategory();

/**
 * LensGrid — Interactive visualization of all 14 analytical lenses.
 *
 * Lenses are organized into 5 category rows. Auto-cycles through the
 * 6 context modes every 3 seconds, lighting up the relevant lenses.
 * Hover/tap a context mode label to highlight its combination.
 */
export function LensGrid() {
  const [activeMode, setActiveMode] = useState<ContextMode>("intimate");
  const [isPaused, setIsPaused] = useState(false);

  const activeLenses = CONTEXT_MODE_LENSES[activeMode];

  // Auto-cycle through modes
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveMode((prev) => {
        const idx = CONTEXT_MODES.indexOf(prev);
        return CONTEXT_MODES[(idx + 1) % CONTEXT_MODES.length];
      });
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleModeHover = useCallback((mode: ContextMode) => {
    setIsPaused(true);
    setActiveMode(mode);
  }, []);

  const handleModeLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Lens categories grid */}
      <div className="space-y-3">
        {CATEGORY_ORDER.map((category) => (
          <div key={category} className="flex items-center gap-3">
            <span className="w-24 text-right font-mono text-[9px] uppercase tracking-widest text-ember-600 flex-shrink-0">
              {CATEGORY_LABELS[category]}
            </span>
            <div className="flex flex-wrap gap-2">
              {LENSES_BY_CATEGORY[category].map((lensId) => {
                const meta = LENS_METADATA[lensId];
                const isActive = activeLenses.includes(lensId);
                return (
                  <div
                    key={lensId}
                    className={`
                      flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      border transition-all duration-300
                      ${
                        isActive
                          ? "border-accent bg-accent/10 text-foreground lens-glow"
                          : "border-border text-ember-700"
                      }
                    `}
                    title={meta.description}
                  >
                    <span
                      className={`
                        w-1.5 h-1.5 rounded-full transition-all duration-300
                        ${isActive ? "bg-accent scale-125" : "bg-ember-700"}
                      `}
                    />
                    <span className="font-mono text-[10px] tracking-wider">
                      {meta.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Context mode selector */}
      <div className="pt-4 border-t border-border">
        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-ember-600 mb-3">
          Context Mode
        </p>
        <div className="flex flex-wrap gap-2">
          {CONTEXT_MODES.map((mode) => {
            const info = CONTEXT_MODE_INFO[mode];
            const isActive = activeMode === mode;
            const lensCount = CONTEXT_MODE_LENSES[mode].length;

            return (
              <button
                key={mode}
                onMouseEnter={() => handleModeHover(mode)}
                onMouseLeave={handleModeLeave}
                onFocus={() => handleModeHover(mode)}
                onBlur={handleModeLeave}
                className={`
                  px-3 py-1.5 rounded-sm border transition-all duration-200
                  font-mono text-[10px] tracking-wider
                  ${
                    isActive
                      ? "border-accent text-foreground bg-accent/5"
                      : "border-border text-ember-600 hover:border-ember-500"
                  }
                `}
              >
                {info.name}
                <span className="ml-1.5 text-ember-700">{lensCount}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
