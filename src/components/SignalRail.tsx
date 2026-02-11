"use client";

import { getTemperatureColor } from "@/lib/temperature";
import type { Message, ConflictAnalysis } from "@/types/database";

interface SignalRailProps {
  messages: Message[];
}

export function SignalRail({ messages }: SignalRailProps) {
  if (messages.length === 0) return null;

  return (
    <div className="flex flex-col w-1.5 rounded-full overflow-hidden shrink-0">
      {messages.map((msg, i) => {
        const isLatest = i === messages.length - 1;
        const hasAnalysis = msg.emotional_temperature != null;
        const color = hasAnalysis
          ? getTemperatureColor(msg.emotional_temperature!)
          : "var(--ember-800)";

        // V3: Check for resolution direction to add directional glow
        const analysis = msg.nvc_analysis as ConflictAnalysis | null;
        const direction = analysis?.meta?.resolutionDirection;
        const directionColor =
          direction === "de-escalating"
            ? "var(--temp-cool)"
            : direction === "escalating"
              ? "var(--temp-hot)"
              : undefined;

        return (
          <div
            key={msg.id}
            className={`flex-1 min-h-6 transition-colors duration-500 signal-segment ${isLatest ? "signal-segment-latest" : ""}`}
            style={{
              backgroundColor: color,
              boxShadow: isLatest && hasAnalysis
                ? `0 0 8px ${directionColor || color}, 0 0 16px ${directionColor || color}`
                : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
