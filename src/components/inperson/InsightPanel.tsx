"use client";

import { getTemperatureLabel } from "@/lib/temperature";

export interface Insight {
  id: string;
  text: string;
  feeling: string;
  needs: string[];
  temperature: number;
}

interface InsightPanelProps {
  personName: string;
  insights: Insight[];
  side: "left" | "right";
}

const tempDotColor: Record<string, string> = {
  hot: "bg-temp-hot",
  warm: "bg-temp-warm",
  cool: "bg-temp-cool",
  neutral: "bg-ember-400",
};

const tempTextColor: Record<string, string> = {
  hot: "text-temp-hot",
  warm: "text-temp-warm",
  cool: "text-temp-cool",
  neutral: "text-ember-400",
};

export function InsightPanel({ personName, insights, side }: InsightPanelProps) {
  const borderSide = side === "left" ? "border-r" : "border-l";

  return (
    <div
      className={`h-full flex flex-col ${borderSide} border-border/50 px-3 py-3`}
    >
      {/* Person name header */}
      <div className={`flex items-center gap-2 mb-3 ${side === "right" ? "justify-end" : ""}`}>
        <span className="w-2 h-2 rounded-full bg-accent" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-ember-300 font-medium">
          {personName}
        </span>
      </div>

      {/* Insight list */}
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-0">
        {insights.length === 0 && (
          <p className="font-mono text-[10px] text-ember-600 italic">
            Insights appear as the conversation unfolds...
          </p>
        )}

        {insights.map((insight, i) => {
          const label = getTemperatureLabel(insight.temperature);
          const dotColor = tempDotColor[label] || tempDotColor.neutral;
          const textColor = tempTextColor[label] || tempTextColor.neutral;
          // Stagger animation delay for new items
          const isRecent = i >= insights.length - 2;

          return (
            <div
              key={insight.id}
              className={`signal-card-enter ${isRecent ? "" : "opacity-80"}`}
              style={{ animationDelay: isRecent ? `${(i % 2) * 100}ms` : "0ms" }}
            >
              {/* Feeling label + temperature dot */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                <span className={`font-mono text-[9px] uppercase tracking-wider ${textColor}`}>
                  {insight.feeling || label}
                </span>
              </div>

              {/* Primary insight text */}
              <p className="text-[11px] leading-snug text-ember-300 pl-3">
                {insight.text}
              </p>

              {/* Unmet needs as tags */}
              {insight.needs.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 pl-3">
                  {insight.needs.slice(0, 3).map((need) => (
                    <span
                      key={need}
                      className="font-mono text-[8px] uppercase tracking-wider text-ember-500 bg-ember-900/50 px-1.5 py-0.5 rounded"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Insight count footer */}
      {insights.length > 0 && (
        <div className={`mt-2 pt-2 border-t border-border/30 ${side === "right" ? "text-right" : ""}`}>
          <span className="font-mono text-[9px] text-ember-600">
            {insights.length} insight{insights.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
