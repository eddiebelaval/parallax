"use client";

import {
  CONTEXT_MODE_INFO,
  CONTEXT_MODE_LENSES,
} from "@/lib/context-modes";
import type { ContextMode } from "@/types/database";

const MODE_GROUPS: { label: string; group: "personal" | "professional" | "formal"; modes: ContextMode[] }[] = [
  {
    label: "Personal",
    group: "personal",
    modes: ["intimate", "family"],
  },
  {
    label: "Professional",
    group: "professional",
    modes: ["professional_peer", "professional_hierarchical"],
  },
  {
    label: "Formal",
    group: "formal",
    modes: ["transactional", "civil_structural"],
  },
];

function ModeCard({ mode }: { mode: ContextMode }) {
  const info = CONTEXT_MODE_INFO[mode];
  const lensCount = CONTEXT_MODE_LENSES[mode].length;

  return (
    <div className="border border-border hover:border-ember-600 transition-colors p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="font-mono text-xs uppercase tracking-wider text-foreground">
          {info.name}
        </p>
        <span className="font-mono text-[10px] text-accent tabular-nums">
          {lensCount} lenses
        </span>
      </div>
      <p className="text-ember-400 text-xs leading-relaxed mb-3">
        {info.description}
      </p>
      <p className="text-ember-600 text-[11px] italic leading-relaxed">
        {info.example}
      </p>
    </div>
  );
}

/**
 * ContextModeCards — Displays the 6 relationship context modes
 * grouped by Personal, Professional, and Formal.
 */
export function ContextModeCards() {
  return (
    <div className="space-y-8">
      {MODE_GROUPS.map((group) => (
        <div key={group.group}>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-ember-600 mb-3">
            {group.label}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.modes.map((mode) => (
              <ModeCard key={mode} mode={mode} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
