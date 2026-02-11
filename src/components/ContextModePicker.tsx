"use client";

import { useState } from "react";
import type { ContextMode, SessionMode } from "@/types/database";
import { CONTEXT_MODE_INFO } from "@/lib/context-modes";

interface ContextModePickerProps {
  sessionMode: SessionMode;
  onSelect: (contextMode: ContextMode) => void;
  onBack: () => void;
  loading: boolean;
}

const MODE_GROUPS = [
  {
    label: "Personal",
    modes: ["intimate", "family"] as ContextMode[],
  },
  {
    label: "Professional",
    modes: ["professional_peer", "professional_hierarchical"] as ContextMode[],
  },
  {
    label: "Formal",
    modes: ["transactional", "civil_structural"] as ContextMode[],
  },
];

export function ContextModePicker({
  sessionMode,
  onSelect,
  onBack,
  loading,
}: ContextModePickerProps) {
  const [selected, setSelected] = useState<ContextMode>("intimate");

  return (
    <div className="max-w-2xl mx-auto px-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ember-500 hover:text-ember-300 transition-colors mb-6"
      >
        <svg width="8" height="8" viewBox="0 0 8 8">
          <path
            d="M5 1L2 4L5 7"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>

      <p className="section-indicator mb-4">Context Mode</p>
      <h2 className="text-2xl sm:text-3xl leading-[1.15] mb-3">
        What kind of conflict is this?
      </h2>
      <p className="text-muted text-sm leading-relaxed mb-8 max-w-lg">
        Different relationships need different lenses. Your choice activates
        the analytical frameworks most relevant to your situation.
      </p>

      <div className="space-y-6 mb-8">
        {MODE_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600 mb-2">
              {group.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.modes.map((mode) => {
                const info = CONTEXT_MODE_INFO[mode];
                const isSelected = selected === mode;

                return (
                  <button
                    key={mode}
                    onClick={() => setSelected(mode)}
                    className={`text-left px-4 py-3 border transition-colors ${
                      isSelected
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-ember-600"
                    }`}
                  >
                    <p
                      className={`font-mono text-xs uppercase tracking-wider mb-1 ${
                        isSelected ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {info.name}
                    </p>
                    <p className="text-ember-500 text-xs leading-relaxed mb-1.5">
                      {info.description}
                    </p>
                    <p className="text-ember-700 text-[11px] italic leading-relaxed">
                      {info.example}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSelect(selected)}
        disabled={loading}
        className="w-full py-4 border border-accent text-accent font-mono text-sm uppercase tracking-wider hover:bg-accent/10 transition-colors disabled:opacity-60"
      >
        {loading
          ? "Creating session..."
          : `Start ${sessionMode === "in_person" ? "in-person" : "remote"} session`}
      </button>
    </div>
  );
}
