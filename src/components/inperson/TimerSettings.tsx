"use client";

import { useState } from "react";

interface TimerSettingsProps {
  currentDuration: number;
  onChange: (duration: number) => void;
  onClose: () => void;
}

const PRESETS = [
  { label: "Quick (2 min)", value: 2 * 60 * 1000 },
  { label: "Standard (3 min)", value: 3 * 60 * 1000 },
  { label: "Extended (5 min)", value: 5 * 60 * 1000 },
  { label: "Long (10 min)", value: 10 * 60 * 1000 },
];

export function TimerSettings({ currentDuration, onChange, onClose }: TimerSettingsProps) {
  const [customMinutes, setCustomMinutes] = useState(
    Math.floor(currentDuration / 60000)
  );

  const handlePresetClick = (duration: number) => {
    onChange(duration);
    onClose();
  };

  const handleCustomSubmit = () => {
    if (customMinutes > 0 && customMinutes <= 30) {
      onChange(customMinutes * 60 * 1000);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-foreground">Timer Duration</h3>
          <button
            onClick={onClose}
            className="text-ember-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Presets */}
        <div className="space-y-2 mb-6">
          <span className="font-mono text-xs uppercase tracking-wider text-ember-muted">
            Presets
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className={`px-4 py-3 rounded-lg border transition-colors text-sm ${
                  preset.value === currentDuration
                    ? "bg-temp-warm/10 border-temp-warm text-temp-warm"
                    : "border-border text-ember-text hover:border-ember-600 hover:bg-ember-elevated"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom duration */}
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-ember-muted">
            Custom (1-30 minutes)
          </span>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="30"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-temp-warm"
              placeholder="Minutes"
            />
            <button
              onClick={handleCustomSubmit}
              disabled={customMinutes < 1 || customMinutes > 30}
              className="px-4 py-2 bg-temp-warm text-background rounded-lg hover:bg-temp-warm/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs uppercase tracking-wider"
            >
              Set
            </button>
          </div>
        </div>

        {/* Current duration display */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ember-muted">Current:</span>
            <span className="text-foreground font-mono">
              {Math.floor(currentDuration / 60000)} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
