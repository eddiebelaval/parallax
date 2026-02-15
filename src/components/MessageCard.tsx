"use client";

import { useState } from "react";
import {
  getTemperatureColor,
  getTemperatureLabel,
  getBacklitClass,
} from "@/lib/temperature";
import { useSettings } from "@/hooks/useSettings";
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
  const { settings } = useSettings();
  const [expanded, setExpanded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const style = SENDER_STYLES[sender];
  const hasAnalysis = nvcAnalysis != null;
  const analysisVisible = hasAnalysis && settings.show_analysis;
  const temperatureVisible = hasAnalysis && settings.show_temperature;

  // V3: Severity-aware Melt timing
  const severity = hasAnalysis
    ? (nvcAnalysis as ConflictAnalysis)?.meta?.overallSeverity ?? nvcAnalysis.emotionalTemperature
    : 0.5;
  const meltPhase = useMelt(hasAnalysis, severity);
  const isCrystallizing = meltPhase === "crystallizing";

  // V3: Check if this is a multi-lens analysis
  const isV3Analysis = hasAnalysis && isConflictAnalysis(nvcAnalysis);
  const v3Analysis = isV3Analysis ? (nvcAnalysis as ConflictAnalysis) : null;

  // Deep dive stays collapsed by default — user expands via chevron

  const tempColor = hasAnalysis
    ? getTemperatureColor(nvcAnalysis.emotionalTemperature)
    : undefined;
  const tempLabel = hasAnalysis
    ? getTemperatureLabel(nvcAnalysis.emotionalTemperature)
    : undefined;

  // Backlit glow class — subtle border pulse during analysis, then temperature glow after
  const backlitClass =
    isAnalyzing && !hasAnalysis
      ? "" // no giant glow during analysis — border pulse handles it
      : hasAnalysis
        ? getBacklitClass(nvcAnalysis.emotionalTemperature, isLatest)
        : "";

  // Organic rolling pulse on the 2px border while analyzing
  const analyzingBorderClass =
    isAnalyzing && !hasAnalysis && sender !== "mediator"
      ? "border-pulse-analyzing"
      : "";

  return (
    <div
      className={`${style.align} w-full ${
        sender === "mediator" ? "max-w-[95%]" : "max-w-[85%]"
      }`}
    >
      <div
        className={`relative pl-4 ml-12 ${backlitClass} ${analyzingBorderClass} ${style.borderClass}`}
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
          {temperatureVisible && (
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

        {/* Deep dive — collapsible accordion with fade preview */}
        {analysisVisible && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="group flex items-center gap-2 w-full text-left"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className={`flex-shrink-0 text-ember-500 transition-transform duration-200 ${
                  expanded ? "rotate-90" : ""
                }`}
              >
                <path
                  d="M3 1.5L7.5 5L3 8.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ember-500 group-hover:text-ember-300 transition-colors">
                Deep dive
              </span>
            </button>

            {/* Preview: 2-line fade when collapsed, full content when expanded */}
            <div className="mt-2">
              {!expanded ? (
                <div
                  className="deep-dive-preview cursor-pointer"
                  onClick={() => setExpanded(true)}
                >
                  <p className="text-ember-400 text-xs leading-relaxed line-clamp-2">
                    {nvcAnalysis.subtext}
                  </p>
                  <div className="deep-dive-fade" />
                </div>
              ) : (
                <div
                  className={`pb-1 space-y-4 ${
                    isCrystallizing ? "melt-crystallize-active" : ""
                  }`}
                >
                  <AnalysisBlock label="Subtext">
                    <p className="text-ember-300 text-sm leading-relaxed">
                      {nvcAnalysis.subtext}
                    </p>
                  </AnalysisBlock>

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

                  <AnalysisBlock label="NVC Translation">
                    <p className="text-success text-sm leading-relaxed border-l border-success pl-3">
                      {nvcAnalysis.nvcTranslation}
                    </p>
                  </AnalysisBlock>

                  {v3Analysis && (
                    <AnalysisBlock label="Lens Analysis">
                      <LensBar
                        activeLenses={v3Analysis.meta.activeLenses}
                        lensResults={v3Analysis.lenses}
                      />
                    </AnalysisBlock>
                  )}
                </div>
              )}
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
