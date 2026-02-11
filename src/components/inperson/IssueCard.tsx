"use client";

import type { Issue } from "@/types/database";

const STATUS_STYLES: Record<string, { border: string; indicator: string; label: string }> = {
  unaddressed: {
    border: "border-ember-800",
    indicator: "bg-ember-600",
    label: "Unaddressed",
  },
  well_addressed: {
    border: "border-success/40",
    indicator: "bg-success",
    label: "Addressed",
  },
  poorly_addressed: {
    border: "border-temp-hot/40",
    indicator: "bg-temp-hot",
    label: "Made worse",
  },
};

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const style = STATUS_STYLES[issue.status] ?? STATUS_STYLES.unaddressed;

  return (
    <div
      className={`px-3 py-2.5 border ${style.border} transition-colors duration-500`}
    >
      <div className="flex items-start gap-2">
        <span
          className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.indicator} transition-colors duration-500`}
        />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs uppercase tracking-wider text-foreground truncate">
            {issue.label}
          </p>
          <p className="text-ember-500 text-xs mt-0.5 line-clamp-2">
            {issue.description}
          </p>
          {issue.grading_rationale && issue.status !== "unaddressed" && (
            <p className="text-ember-600 text-[10px] mt-1 italic">
              {issue.grading_rationale}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end mt-1">
        <span className="font-mono text-[9px] uppercase tracking-widest text-ember-700">
          {style.label}
        </span>
      </div>
    </div>
  );
}
