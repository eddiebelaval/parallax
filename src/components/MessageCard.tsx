"use client";

import { useState, useEffect } from "react";
import {
  getTemperatureColor,
  getTemperatureLabel,
  getBacklitClass,
} from "@/lib/temperature";
import { useMelt, MeltText } from "./TheMelt";
import { EssenceBullets } from "./EssenceBullets";
import { LensBar } from "./lenses/LensBar";
import type {
  NvcAnalysis,
  ConflictAnalysis,
  MessageSender,
} from "@/types/database";

interface MessageCardProps {
  sender: MessageSender;
  senderName: string;
  content: string;
  timestamp: string;
  nvcAnalysis?: NvcAnalysis | ConflictAnalysis | null;
  isLatest?: boolean;
  isAnalyzing?: boolean;
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

// Type guard for V3 analysis
function isConflictAnalysis(
  a: NvcAnalysis | ConflictAnalysis
): a is ConflictAnalysis {
  return "lenses" in a && "meta" in a;
}

export function MessageCard({
  sender,
  senderName,
  content,
  timestamp,
  nvcAnalysis,
  isLatest = false,
  isAnalyzing = false,
}: MessageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const style = SENDER_STYLES[sender];
  const hasAnalysis = nvcAnalysis != null;

  // V3: Severity-aware Melt timing
  const severity = hasAnalysis
    ? (nvcAnalysis as ConflictAnalysis)?.meta?.overallSeverity ?? nvcAnalysis.emotionalTemperature
    : 0.5;
  const meltPhase = useMelt(hasAnalysis, severity);
  const isCrystallizing = meltPhase === "crystallizing";

  // V3: Check if this is a multi-lens analysis
  const isV3Analysis = hasAnalysis && isConflictAnalysis(nvcAnalysis);
  const v3Analysis = isV3Analysis ? (nvcAnalysis as ConflictAnalysis) : null;

  // Auto-expand analysis when crystallize phase begins
  useEffect(() => {
    if (isCrystallizing) setExpanded(true);
  }, [isCrystallizing]);

  const tempColor = hasAnalysis
    ? getTemperatureColor(nvcAnalysis.emotionalTemperature)
    : undefined;
  const tempLabel = hasAnalysis
    ? getTemperatureLabel(nvcAnalysis.emotionalTemperature)
    : undefined;

  // Backlit glow class — analyzing pulse, then temperature-based when analysis arrives
  const backlitClass =
    isAnalyzing && !hasAnalysis
      ? "backlit backlit-analyzing"
      : hasAnalysis
        ? getBacklitClass(nvcAnalysis.emotionalTemperature, isLatest)
        : "";

  return (
    <div
      className={`${style.align} w-full ${
        sender === "mediator" ? "max-w-[95%]" : "max-w-[85%]"
      }`}
    >
      <div
        className={`relative pl-4 ml-12 ${backlitClass} ${style.borderClass}`}
        style={
          hasAnalysis && sender !== "mediator"
            ? { borderLeft: `2px solid ${tempColor}` }
            : undefined
        }
      >
        {/* Header: sender + timestamp + temperature badge + direction */}
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className={`font-mono text-xs uppercase tracking-wider ${style.nameColor}`}
          >
            {sender === "mediator" ? "Ava" : senderName}
          </span>
          <span className="font-mono text-xs text-ember-700">
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
          {/* V3: Resolution direction indicator */}
          {v3Analysis && (
            <DirectionIndicator direction={v3Analysis.meta.resolutionDirection} />
          )}
        </div>

        {/* Message content — dissolves during The Melt, then essence bullets crystallize in */}
        {hasAnalysis &&
        sender !== "mediator" &&
        (meltPhase === "crystallizing" || meltPhase === "settled") &&
        !showTranscript ? (
          <EssenceBullets
            analysis={nvcAnalysis!}
            phase={meltPhase}
            temperatureColor={tempColor}
          />
        ) : (
          <MeltText
            content={content}
            phase={showTranscript ? "settled" : meltPhase}
            temperatureColor={tempColor}
            className={`text-sm leading-relaxed ${
              sender === "mediator"
                ? "text-ember-300 italic"
                : "text-foreground"
            }`}
          />
        )}

        {/* Essence / transcript toggle — settled phase only */}
        {hasAnalysis && sender !== "mediator" && meltPhase === "settled" && (
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-1.5 mt-2 font-mono text-[10px] uppercase tracking-widest text-ember-600 hover:text-ember-400 transition-colors"
          >
            {showTranscript ? "Show essence" : "Show transcript"}
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              className={`transition-transform duration-200 ${
                showTranscript ? "rotate-180" : ""
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
        )}

        {/* NVC Analysis — expand/collapse */}
        {hasAnalysis && (
          <div className="mt-3">
            {/* Toggle hidden during crystallize — analysis appears directly */}
            {!isCrystallizing && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ember-500 hover:text-ember-300 transition-colors"
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
            )}

            <div
              className="analysis-reveal"
              data-expanded={expanded || isCrystallizing}
            >
              <div>
                <div
                  className={`pt-3 pb-1 space-y-4 ${
                    isCrystallizing ? "melt-crystallize-active" : ""
                  }`}
                >
                  {/* Subtext */}
                  <AnalysisBlock label="Subtext">
                    <p className="text-ember-300 text-sm leading-relaxed">
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
                            className="text-ember-400 text-sm flex items-start gap-2"
                          >
                            <span className="mt-1.5 block w-1 h-1 rounded-full bg-ember-600 flex-shrink-0" />
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
                            className="px-2 py-0.5 border border-border text-ember-400 font-mono text-[11px] uppercase tracking-wider rounded"
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

                  {/* V3 Tier 2+3: Multi-lens analysis bar */}
                  {v3Analysis && (
                    <AnalysisBlock label="Lens Analysis">
                      <LensBar
                        activeLenses={v3Analysis.meta.activeLenses}
                        lensResults={v3Analysis.lenses}
                      />
                    </AnalysisBlock>
                  )}
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
      <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600 mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}

function DirectionIndicator({
  direction,
}: {
  direction: "escalating" | "stable" | "de-escalating";
}) {
  const config = {
    escalating: { symbol: "^", color: "var(--temp-hot)", label: "escalating" },
    stable: { symbol: "-", color: "var(--temp-warm)", label: "stable" },
    "de-escalating": {
      symbol: "v",
      color: "var(--temp-cool)",
      label: "de-escalating",
    },
  };
  const c = config[direction];

  return (
    <span
      className="font-mono text-[9px] uppercase tracking-wider"
      style={{ color: c.color }}
      title={c.label}
    >
      {c.symbol}
    </span>
  );
}
