"use client";

import { useRouter } from "next/navigation";
import type { SessionSummaryData } from "@/types/database";

interface InlineSessionSummaryProps {
  summaryData: SessionSummaryData | null;
  summaryLoading: boolean;
  onExport: () => void;
}

/**
 * Inline session summary panel shown at the bottom of the conversation
 * when a session ends. Shared between RemoteView and XRayGlanceView.
 */
export function InlineSessionSummary({
  summaryData,
  summaryLoading,
  onExport,
}: InlineSessionSummaryProps): React.ReactNode {
  const router = useRouter();

  if (summaryLoading) {
    return (
      <div className="px-4 py-6 flex items-center justify-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-ember-500">
          Generating summary...
        </span>
      </div>
    );
  }

  if (summaryData) {
    return (
      <div className="px-4 py-4 space-y-4 max-h-[50vh] overflow-y-auto">
        <div className="border-l-2 border-accent pl-4 py-1">
          <p className="text-foreground text-sm leading-relaxed font-serif">
            {summaryData.overallInsight}
          </p>
        </div>
        {summaryData.keyMoments.length > 0 && (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
              Key Moments
            </p>
            <ul className="space-y-1.5">
              {summaryData.keyMoments.map((moment, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs leading-relaxed text-ember-300"
                >
                  <span className="mt-1 block w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                  {moment}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onExport}
            className="font-mono text-[10px] uppercase tracking-widest text-ember-600 hover:text-foreground transition-colors border border-border px-4 py-2 hover:border-foreground/20"
          >
            Export
          </button>
          <button
            onClick={() => router.push("/home")}
            className="font-mono text-[10px] uppercase tracking-widest text-accent hover:text-foreground transition-colors border border-accent/30 px-4 py-2 hover:border-foreground/20"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-ember-500">
        Session ended
      </span>
      <button
        onClick={() => router.push("/home")}
        className="font-mono text-[10px] uppercase tracking-widest text-accent hover:text-foreground transition-colors"
      >
        Home
      </button>
    </div>
  );
}
