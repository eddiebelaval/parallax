"use client";

import { useState } from "react";
import {
  getTemperatureColor,
  getTemperatureLabel,
} from "@/lib/temperature";
import type { NvcAnalysis, MessageSender } from "@/types/database";

interface MessageCardProps {
  sender: MessageSender;
  senderName: string;
  content: string;
  timestamp: string;
  nvcAnalysis?: NvcAnalysis | null;
}

const SENDER_STYLES: Record<
  MessageCardProps["sender"],
  { align: string; nameColor: string; borderClass: string }
> = {
  person_a: {
    align: "self-start",
    nameColor: "text-accent",
    borderClass: "",
  },
  person_b: {
    align: "self-end",
    nameColor: "text-accent-secondary",
    borderClass: "",
  },
  mediator: {
    align: "self-center",
    nameColor: "text-success",
    borderClass: "border-l-2 border-success",
  },
};

export function MessageCard({
  sender,
  senderName,
  content,
  timestamp,
  nvcAnalysis,
}: MessageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const style = SENDER_STYLES[sender];
  const hasAnalysis = nvcAnalysis != null;

  const tempColor = hasAnalysis
    ? getTemperatureColor(nvcAnalysis.emotionalTemperature)
    : undefined;
  const tempLabel = hasAnalysis
    ? getTemperatureLabel(nvcAnalysis.emotionalTemperature)
    : undefined;

  return (
    <div
      className={`${style.align} w-full ${
        sender === "mediator" ? "max-w-[95%]" : "max-w-[85%]"
      }`}
    >
      <div
        className={`relative pl-4 ${style.borderClass}`}
        style={
          hasAnalysis && sender !== "mediator"
            ? { borderLeft: `2px solid ${tempColor}` }
            : undefined
        }
      >
        {/* Header: sender + timestamp + temperature badge */}
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className={`font-mono text-xs uppercase tracking-wider ${style.nameColor}`}
          >
            {sender === "mediator" ? "Claude" : senderName}
          </span>
          <span className="font-mono text-xs text-factory-gray-700">
            {timestamp}
          </span>
          {hasAnalysis && (
            <span
              className="font-mono text-[10px] uppercase tracking-wider ml-auto"
              style={{ color: tempColor }}
            >
              {tempLabel}
            </span>
          )}
        </div>

        {/* Message content */}
        <p
          className={`text-sm leading-relaxed ${
            sender === "mediator"
              ? "text-factory-gray-300 italic"
              : "text-foreground"
          }`}
        >
          {content}
        </p>

        {/* NVC Analysis — expand/collapse */}
        {hasAnalysis && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-factory-gray-500 hover:text-factory-gray-300 transition-colors"
            >
              <span
                className="inline-block w-1 h-1 rounded-full"
                style={{ background: tempColor }}
              />
              {expanded ? "Hide analysis" : "What's beneath"}
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                className={`transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
              >
                <path
                  d="M1 3L4 6L7 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="analysis-reveal" data-expanded={expanded}>
              <div>
                <div className="pt-3 pb-1 space-y-4">
                  {/* Subtext */}
                  <AnalysisBlock label="Subtext">
                    <p className="text-factory-gray-300 text-sm leading-relaxed">
                      {nvcAnalysis.subtext}
                    </p>
                  </AnalysisBlock>

                  {/* Blind spots */}
                  {nvcAnalysis.blindSpots.length > 0 && (
                    <AnalysisBlock label="Blind Spots">
                      <ul className="space-y-1">
                        {nvcAnalysis.blindSpots.map((spot, i) => (
                          <li
                            key={i}
                            className="text-factory-gray-400 text-sm flex items-start gap-2"
                          >
                            <span className="mt-1.5 block w-1 h-1 rounded-full bg-factory-gray-600 flex-shrink-0" />
                            {spot}
                          </li>
                        ))}
                      </ul>
                    </AnalysisBlock>
                  )}

                  {/* Unmet needs */}
                  {nvcAnalysis.unmetNeeds.length > 0 && (
                    <AnalysisBlock label="Unmet Needs">
                      <div className="flex flex-wrap gap-2">
                        {nvcAnalysis.unmetNeeds.map((need, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 border border-border text-factory-gray-400 font-mono text-[11px] uppercase tracking-wider"
                          >
                            {need}
                          </span>
                        ))}
                      </div>
                    </AnalysisBlock>
                  )}

                  {/* NVC Translation */}
                  <AnalysisBlock label="NVC Translation">
                    <p className="text-success text-sm leading-relaxed border-l border-success pl-3">
                      {nvcAnalysis.nvcTranslation}
                    </p>
                  </AnalysisBlock>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-factory-gray-600 mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}
