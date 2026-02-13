"use client";

import { getTemperatureColor, getTemperatureLabel } from "@/lib/temperature";
import type { Message, ConflictAnalysis } from "@/types/database";

interface SignalRailProps {
  messages: Message[];
  showLabels?: boolean;
}

/**
 * SignalRail — Visual timeline of emotional temperature over conversation
 * Each segment represents one message, colored by temperature.
 * Latest segment pulses with directional glow (escalating vs de-escalating).
 */
export function SignalRail({ messages, showLabels = false }: SignalRailProps) {
  if (messages.length === 0) return null;

  const humanMessages = messages.filter(m => m.sender !== "mediator");

  return (
    <div className="flex flex-col gap-2">
      {showLabels && (
        <span className="font-mono text-[8px] uppercase tracking-widest text-ember-600">
          Emotional Arc
        </span>
      )}
      <div className="flex flex-col w-2 rounded-full overflow-hidden shrink-0 relative">
        {humanMessages.map((msg, i) => {
          const isLatest = i === humanMessages.length - 1;
          const hasAnalysis = msg.emotional_temperature != null;
          const temp = msg.emotional_temperature ?? 0.5;
          const color = hasAnalysis
            ? getTemperatureColor(temp)
            : "var(--ember-800)";

          // V3: Check for resolution direction to add directional glow
          const analysis = msg.nvc_analysis as ConflictAnalysis | null;
          const direction = analysis?.meta?.resolutionDirection;
          const directionColor =
            direction === "de-escalating"
              ? "var(--temp-cool)"
              : direction === "escalating"
              ? "var(--temp-hot)"
              : color;

          // Intensity based on temperature
          const intensity = temp > 0.7 ? "strong" : temp > 0.4 ? "medium" : "weak";

          return (
            <div
              key={msg.id}
              className={`flex-1 min-h-6 transition-all duration-500 signal-segment ${
                isLatest ? "signal-segment-latest" : ""
              } relative group`}
              style={{
                backgroundColor: color,
                boxShadow:
                  isLatest && hasAnalysis
                    ? intensity === "strong"
                      ? `0 0 12px ${directionColor}, 0 0 24px ${directionColor}`
                      : intensity === "medium"
                      ? `0 0 8px ${directionColor}, 0 0 16px ${directionColor}`
                      : `0 0 6px ${directionColor}`
                    : "none",
              }}
              title={hasAnalysis ? `${getTemperatureLabel(temp)} • ${direction || "stable"}` : ""}
            >
              {/* Hover tooltip */}
              {hasAnalysis && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-surface border border-border rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color }}>
                    {getTemperatureLabel(temp)}
                  </span>
                  {direction && (
                    <span className="ml-1 font-mono text-[8px] text-ember-500">
                      {direction === "de-escalating" ? "↓" : direction === "escalating" ? "↑" : "→"}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showLabels && humanMessages.length > 0 && (
        <span className="font-mono text-[8px] text-ember-600">
          {humanMessages.length} {humanMessages.length === 1 ? "exchange" : "exchanges"}
        </span>
      )}
    </div>
  );
}
