"use client";

import { getTemperatureColor } from "@/lib/temperature";
import type { Message } from "@/types/database";

interface SignalRailProps {
  messages: Message[];
}

export function SignalRail({ messages }: SignalRailProps) {
  if (messages.length === 0) return null;

  return (
    <div className="flex flex-col w-1 rounded-full overflow-hidden shrink-0">
      {messages.map((msg, i) => {
        const isLatest = i === messages.length - 1;
        const hasAnalysis = msg.emotional_temperature != null;
        const color = hasAnalysis
          ? getTemperatureColor(msg.emotional_temperature!)
          : "#3a3632";

        return (
          <div
            key={msg.id}
            className={`flex-1 min-h-6 transition-colors duration-500 signal-segment ${isLatest ? "signal-segment-latest" : ""}`}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}
