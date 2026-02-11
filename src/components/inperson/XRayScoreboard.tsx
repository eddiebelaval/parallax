"use client";

import { IssueCard } from "./IssueCard";
import type { Issue } from "@/types/database";

interface XRayScoreboardProps {
  personAIssues: Issue[];
  personBIssues: Issue[];
  personAName: string;
  personBName: string;
}

export function XRayScoreboard({
  personAIssues,
  personBIssues,
  personAName,
  personBName,
}: XRayScoreboardProps) {
  const hasAny = personAIssues.length > 0 || personBIssues.length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-border">
        <p className="section-indicator">X-Ray Scoreboard</p>
      </div>

      {!hasAny ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-ember-600 font-mono text-xs uppercase tracking-wider text-center">
            Issues will appear here as the conversation progresses
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-0">
            {/* Person A's issues */}
            <IssueColumn
              name={personAName}
              issues={personAIssues}
              side="left"
            />
            {/* Person B's issues */}
            <IssueColumn
              name={personBName}
              issues={personBIssues}
              side="right"
            />
          </div>
        </div>
      )}

      {/* Legend */}
      {hasAny && (
        <div className="px-3 py-2 border-t border-border flex items-center justify-center gap-4">
          <LegendItem color="bg-ember-600" label="Open" />
          <LegendItem color="bg-success" label="Resolved" />
          <LegendItem color="bg-temp-hot" label="Worse" />
        </div>
      )}
    </div>
  );
}

function IssueColumn({
  name,
  issues,
  side,
}: {
  name: string;
  issues: Issue[];
  side: "left" | "right";
}) {
  return (
    <div className={`flex flex-col ${side === "left" ? "border-r border-border" : ""}`}>
      <div className="px-3 py-1.5 border-b border-border">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ember-500">
          {name}
        </span>
        {issues.length > 0 && (
          <span className="ml-2 font-mono text-[10px] text-ember-700">
            {issues.filter((i) => i.status === "well_addressed").length}/{issues.length}
          </span>
        )}
      </div>
      <div className="p-2 space-y-2">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
        {issues.length === 0 && (
          <p className="text-ember-700 font-mono text-[10px] uppercase tracking-wider text-center py-4">
            No issues yet
          </p>
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="font-mono text-[9px] uppercase tracking-widest text-ember-600">
        {label}
      </span>
    </div>
  );
}
