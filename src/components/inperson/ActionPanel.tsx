"use client";

import type { Issue, IssueStatus } from "@/types/database";

interface ActionPanelProps {
  personName: string;
  issues: Issue[];
  side: "left" | "right";
  onUpdateStatus: (issueId: string, status: IssueStatus) => void;
}

const statusConfig: Record<string, { dot: string; text: string; label: string }> = {
  unaddressed: { dot: "bg-temp-warm", text: "text-temp-warm", label: "Open" },
  poorly_addressed: { dot: "bg-temp-hot", text: "text-temp-hot", label: "Escalated" },
  deferred: { dot: "bg-ember-500", text: "text-ember-500", label: "For later" },
  well_addressed: { dot: "bg-temp-cool", text: "text-temp-cool", label: "Resolved" },
};

export function ActionPanel({ personName, issues, side, onUpdateStatus }: ActionPanelProps) {
  const borderSide = side === "left" ? "border-r" : "border-l";

  // Group issues by priority tier
  const needsAttention = issues.filter(
    (i) => i.status === "unaddressed" || i.status === "poorly_addressed"
  );
  const deferred = issues.filter((i) => i.status === "deferred");
  const resolved = issues.filter((i) => i.status === "well_addressed");

  const totalOpen = needsAttention.length + deferred.length;

  return (
    <div className={`h-full flex flex-col ${borderSide} border-border/50 px-3 py-3`}>
      {/* Person name header */}
      <div className={`flex items-center gap-2 mb-3 ${side === "right" ? "justify-end" : ""}`}>
        <span className="w-2 h-2 rounded-full bg-accent" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-ember-300 font-medium">
          {personName}
        </span>
        {totalOpen > 0 && (
          <span className="font-mono text-[9px] text-temp-warm bg-temp-warm/10 px-1.5 py-0.5 rounded">
            {totalOpen}
          </span>
        )}
      </div>

      {/* Issue list */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
        {issues.length === 0 && (
          <p className="font-mono text-[10px] text-ember-600 italic">
            Issues appear as the conversation unfolds...
          </p>
        )}

        {/* --- Needs Attention --- */}
        {needsAttention.length > 0 && (
          <div className="mb-2">
            <span className="font-mono text-[8px] uppercase tracking-widest text-temp-warm/70 block mb-1.5">
              Address now
            </span>
            {needsAttention.map((issue) => (
              <ActionItem
                key={issue.id}
                issue={issue}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        )}

        {/* --- Deferred --- */}
        {deferred.length > 0 && (
          <div className="mb-2">
            <span className="font-mono text-[8px] uppercase tracking-widest text-ember-500/70 block mb-1.5">
              For later
            </span>
            {deferred.map((issue) => (
              <ActionItem
                key={issue.id}
                issue={issue}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        )}

        {/* --- Resolved --- */}
        {resolved.length > 0 && (
          <div className="mb-2 opacity-50">
            <span className="font-mono text-[8px] uppercase tracking-widest text-temp-cool/50 block mb-1.5">
              Resolved
            </span>
            {resolved.map((issue) => (
              <ActionItem
                key={issue.id}
                issue={issue}
                onUpdateStatus={onUpdateStatus}
                resolved
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Individual issue item ---

interface ActionItemProps {
  issue: Issue;
  onUpdateStatus: (issueId: string, status: IssueStatus) => void;
  resolved?: boolean;
}

function ActionItem({ issue, onUpdateStatus, resolved = false }: ActionItemProps) {
  const config = statusConfig[issue.status] || statusConfig.unaddressed;

  return (
    <div className="signal-card-enter group mb-1.5">
      <div className="flex items-start gap-1.5">
        {/* Checkable dot — tap to resolve */}
        <button
          onClick={() =>
            onUpdateStatus(
              issue.id,
              resolved ? "unaddressed" : "well_addressed"
            )
          }
          className={`mt-0.5 w-3 h-3 rounded-full flex-shrink-0 border transition-all duration-200 ${
            resolved
              ? "bg-temp-cool border-temp-cool"
              : `border-current ${config.text} hover:bg-current/20`
          }`}
          aria-label={resolved ? "Mark as unresolved" : "Mark as resolved"}
        >
          {resolved && (
            <svg viewBox="0 0 12 12" className="w-3 h-3 text-ember-dark">
              <path
                d="M3 6l2 2 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Issue label */}
          <p
            className={`font-mono text-[10px] uppercase tracking-wider leading-tight ${
              resolved
                ? "text-ember-600 line-through"
                : "text-ember-200"
            }`}
          >
            {issue.label}
          </p>

          {/* Description */}
          <p
            className={`text-[10px] leading-snug mt-0.5 line-clamp-2 ${
              resolved ? "text-ember-700" : "text-ember-400"
            }`}
          >
            {issue.description}
          </p>

          {/* Status badge + actions */}
          <div className="flex items-center gap-2 mt-1">
            <span className={`font-mono text-[8px] uppercase tracking-wider ${config.text}`}>
              {config.label}
            </span>

            {/* Defer button (only for unaddressed/poorly_addressed) */}
            {!resolved && issue.status !== "deferred" && (
              <button
                onClick={() => onUpdateStatus(issue.id, "deferred")}
                className="font-mono text-[8px] uppercase tracking-wider text-ember-600 hover:text-ember-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                Later
              </button>
            )}

            {/* Undefer button */}
            {issue.status === "deferred" && (
              <button
                onClick={() => onUpdateStatus(issue.id, "unaddressed")}
                className="font-mono text-[8px] uppercase tracking-wider text-ember-600 hover:text-ember-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                Move up
              </button>
            )}

            {/* Grading rationale */}
            {issue.grading_rationale && (
              <span className="font-mono text-[8px] text-ember-600 italic truncate">
                {issue.grading_rationale}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
