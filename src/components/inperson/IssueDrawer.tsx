"use client";

import { IssueCard } from "./IssueCard";
import type { Issue } from "@/types/database";

interface IssueDrawerProps {
  open: boolean;
  onClose: () => void;
  personAIssues: Issue[];
  personBIssues: Issue[];
  personAName: string;
  personBName: string;
}

export function IssueDrawer({
  open,
  onClose,
  personAIssues,
  personBIssues,
  personAName,
  personBName,
}: IssueDrawerProps) {
  if (!open) return null;

  const totalIssues = personAIssues.length + personBIssues.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ember-950/60"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-80 max-w-[85vw] bg-surface border-l border-border flex flex-col overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground">
              Issues
            </span>
            {totalIssues > 0 && (
              <span className="font-mono text-[10px] text-ember-500">
                ({totalIssues})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-ember-600 hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>

        {/* Issue lists */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {totalIssues === 0 ? (
            <p className="text-ember-600 text-xs text-center py-8">
              Issues will appear as the conversation progresses
            </p>
          ) : (
            <>
              {/* Person A Issues */}
              {personAIssues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-temp-warm" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-ember-500">
                      {personAName} ({personAIssues.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {personAIssues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </div>
              )}

              {/* Person B Issues */}
              {personBIssues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-temp-hot" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-ember-500">
                      {personBName} ({personBIssues.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {personBIssues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
