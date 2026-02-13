"use client";

import { useState, useEffect, useRef } from "react";
import type { SoloMemory } from "@/types/database";

interface SoloSidebarProps {
  insights: SoloMemory | null;
}

/**
 * Typewriter that captures delay at mount time via ref.
 * This prevents re-animation when parent state changes cause
 * the `isFirst` flag to flip (which would change delay values).
 */
function GhostTypewriter({
  text,
  delay = 0,
  speed = 15,
  cursor = true,
}: {
  text: string;
  delay?: number;
  speed?: number;
  cursor?: boolean;
}) {
  const [charIndex, setCharIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const mountDelayRef = useRef(delay);

  useEffect(() => {
    setCharIndex(0);
    setStarted(false);
    const t = setTimeout(() => setStarted(true), mountDelayRef.current);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    if (!started || charIndex >= text.length) return;
    const t = setTimeout(() => setCharIndex((i) => i + 1), speed);
    return () => clearTimeout(t);
  }, [started, charIndex, text, speed]);

  if (!started) return null;

  return (
    <span>
      {text.slice(0, charIndex)}
      {cursor && charIndex < text.length && (
        <span className="animate-pulse text-temp-cool">|</span>
      )}
    </span>
  );
}

function emotionColor(state: string | null): string {
  if (!state) return "text-ember-600";
  const s = state.toLowerCase();
  if (s.includes("frustrat") || s.includes("angry") || s.includes("upset"))
    return "text-temp-hot";
  if (s.includes("anxious") || s.includes("worried") || s.includes("stress"))
    return "text-temp-warm";
  if (s.includes("calm") || s.includes("hopeful") || s.includes("peace"))
    return "text-temp-cool";
  if (s.includes("sad") || s.includes("hurt") || s.includes("lonely"))
    return "text-temp-warm";
  return "text-ember-400";
}

export function SoloSidebar({ insights }: SoloSidebarProps) {
  const hasPopulatedRef = useRef(false);

  useEffect(() => {
    if (insights && !hasPopulatedRef.current) {
      hasPopulatedRef.current = true;
    }
  }, [insights]);

  const isFirst = !hasPopulatedRef.current;

  if (!insights) {
    return (
      <div className="px-4 py-6">
        <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-4">
          Insights
        </p>
        <p className="text-ember-600 text-xs leading-relaxed">
          Insights will appear as you talk...
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Identity Hero */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600">
            Insights
          </p>
          {insights.sessionCount > 0 && (
            <p className="font-mono text-[9px] text-ember-700">
              #{insights.sessionCount}
            </p>
          )}
        </div>
        {insights.identity?.name && (
          <p className="font-serif text-lg text-heading tracking-tight">
            <GhostTypewriter
              text={insights.identity.name}
              delay={isFirst ? 100 : 50}
              speed={20}
            />
          </p>
        )}
        {insights.emotionalState && (
          <p
            className={`font-mono text-[10px] uppercase tracking-widest mt-1 ${emotionColor(insights.emotionalState)}`}
          >
            <GhostTypewriter
              text={insights.emotionalState}
              delay={isFirst ? 400 : 80}
              speed={18}
            />
          </p>
        )}
      </div>

      {/* Situation */}
      {insights.currentSituation && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            Situation
          </p>
          <p className="text-ember-400 text-[11px] leading-relaxed">
            <GhostTypewriter
              text={insights.currentSituation}
              delay={isFirst ? 800 : 100}
              speed={12}
            />
          </p>
        </div>
      )}

      {/* Themes */}
      {insights.themes.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            Themes
          </p>
          <div className="flex flex-wrap gap-1">
            {insights.themes.map((theme, i) => (
              <span
                key={theme}
                className="font-mono text-[8px] uppercase tracking-wider border border-ember-800 rounded-sm px-2 py-0.5 text-ember-500 signal-card-enter"
                style={{
                  animationDelay: isFirst ? `${1200 + i * 150}ms` : `${i * 50}ms`,
                }}
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Patterns */}
      {insights.patterns.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            Patterns
          </p>
          <div className="space-y-1.5">
            {insights.patterns.map((pattern, i) => (
              <div
                key={pattern}
                className="pl-3 border-l-2 border-temp-warm text-ember-400 text-[11px] leading-relaxed signal-card-enter"
                style={{
                  animationDelay: isFirst ? `${2000 + i * 200}ms` : `${i * 60}ms`,
                }}
              >
                {pattern}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Values + Strengths */}
      {(insights.values.length > 0 || insights.strengths.length > 0) && (
        <div>
          {insights.values.length > 0 && (
            <>
              <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
                Values
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {insights.values.map((v) => (
                  <span
                    key={v}
                    className="font-mono text-[8px] uppercase tracking-wider text-temp-cool/70 border border-temp-cool/20 rounded-sm px-2 py-0.5"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </>
          )}
          {insights.strengths.length > 0 && (
            <>
              <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
                Strengths
              </p>
              <div className="flex flex-wrap gap-1">
                {insights.strengths.map((s) => (
                  <span
                    key={s}
                    className="font-mono text-[8px] uppercase tracking-wider text-temp-warm/70 border border-temp-warm/20 rounded-sm px-2 py-0.5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Important People */}
      {insights.identity?.importantPeople?.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            People
          </p>
          <div className="space-y-1">
            {insights.identity.importantPeople.map((p) => (
              <div key={p.name} className="flex items-baseline gap-2">
                <span className="text-ember-400 text-[11px]">{p.name}</span>
                <span className="font-mono text-[8px] uppercase tracking-wider text-ember-700">
                  {p.relationship}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {insights.actionItems.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            Work On
          </p>
          <div className="space-y-2">
            {insights.actionItems.map((item) => {
              const done = item.status === "completed";
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-2 ${done ? "opacity-50" : ""}`}
                >
                  <span
                    className={`mt-0.5 w-3 h-3 rounded-full border flex-shrink-0 ${
                      done
                        ? "bg-temp-cool border-temp-cool"
                        : "border-ember-700"
                    }`}
                  />
                  <span
                    className={`text-[11px] leading-relaxed ${
                      done
                        ? "text-ember-700 line-through"
                        : "text-ember-400"
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
