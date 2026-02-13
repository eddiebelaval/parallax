"use client";

import { useState, useEffect, useRef } from "react";
import type { SoloMemory } from "@/types/database";

interface SoloSidebarProps {
  insights: SoloMemory | null;
}

/**
 * Typewriter that only animates ONCE per unique text.
 * Uses a module-level Set to track what's been typed before.
 * If the text was already shown, it renders instantly.
 */
const typedTexts = new Set<string>();

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
  const alreadyTyped = typedTexts.has(text);
  const [charIndex, setCharIndex] = useState(alreadyTyped ? text.length : 0);
  const [started, setStarted] = useState(alreadyTyped);
  const mountDelayRef = useRef(delay);

  useEffect(() => {
    if (alreadyTyped) {
      setCharIndex(text.length);
      setStarted(true);
      return;
    }
    setCharIndex(0);
    setStarted(false);
    const t = setTimeout(() => setStarted(true), mountDelayRef.current);
    return () => clearTimeout(t);
  }, [text, alreadyTyped]);

  useEffect(() => {
    if (!started || charIndex >= text.length) {
      if (started && charIndex >= text.length) {
        typedTexts.add(text);
      }
      return;
    }
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
  // Track which list items have been rendered before.
  // Items in this set render instantly; items NOT in it get entrance animation.
  const seenItemsRef = useRef(new Set<string>());
  const isFirstPopulation = useRef(true);

  // After each render, mark all current items as "seen"
  useEffect(() => {
    if (!insights) return;
    if (isFirstPopulation.current) {
      isFirstPopulation.current = false;
    }
    insights.themes.forEach((t) => seenItemsRef.current.add(`theme:${t.toLowerCase()}`));
    insights.patterns.forEach((p) => seenItemsRef.current.add(`pattern:${p.toLowerCase()}`));
    insights.values.forEach((v) => seenItemsRef.current.add(`value:${v.toLowerCase()}`));
    insights.strengths.forEach((s) => seenItemsRef.current.add(`strength:${s.toLowerCase()}`));
    insights.actionItems.forEach((a) => seenItemsRef.current.add(`action:${a.id}`));
    insights.identity?.importantPeople?.forEach((p) =>
      seenItemsRef.current.add(`person:${p.name.toLowerCase()}`),
    );
  });

  /** Returns true if this is a brand new item that should animate in. */
  function isNew(prefix: string, key: string): boolean {
    return !seenItemsRef.current.has(`${prefix}:${key.toLowerCase()}`);
  }

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

  // Count new items for staggered animation delays
  let newItemIndex = 0;

  return (
    <div className="px-4 py-4 space-y-5">
      {/* ─── Identity Hero (wiki-style) ─── */}
      <div className="pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600">
            Insights
          </p>
          {insights.sessionCount > 0 && (
            <span className="font-mono text-[8px] uppercase tracking-wider text-temp-cool/60 border border-temp-cool/20 rounded-sm px-1.5 py-0.5">
              Session #{insights.sessionCount}
            </span>
          )}
        </div>
        {insights.identity?.name && (
          <p className="font-serif text-xl text-heading tracking-tight mb-1">
            <GhostTypewriter
              text={insights.identity.name}
              delay={isFirstPopulation.current ? 100 : 0}
              speed={20}
            />
          </p>
        )}
        {/* Badge row under the name */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {insights.emotionalState && (
            <span
              className={`font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm border ${emotionColor(insights.emotionalState)} border-current/20`}
            >
              {insights.emotionalState}
            </span>
          )}
          {insights.identity?.bio && (
            <span className="font-mono text-[8px] tracking-wider text-ember-600 px-1.5 py-0.5">
              {insights.identity.bio}
            </span>
          )}
        </div>
      </div>

      {/* ─── Situation ─── */}
      {insights.currentSituation && (
        <div className="pb-3 border-b border-border/50">
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            Situation
          </p>
          <p className="text-ember-400 text-[11px] leading-relaxed">
            <GhostTypewriter
              text={insights.currentSituation}
              delay={isFirstPopulation.current ? 400 : 0}
              speed={10}
              cursor={false}
            />
          </p>
        </div>
      )}

      {/* ─── Themes ─── */}
      {insights.themes.length > 0 && (
        <div className="pb-3 border-b border-border/50">
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            Themes
          </p>
          <div className="flex flex-wrap gap-1">
            {insights.themes.map((theme) => {
              const fresh = isNew("theme", theme);
              const animDelay = fresh ? `${100 + newItemIndex++ * 120}ms` : "0ms";
              return (
                <span
                  key={theme}
                  className={`font-mono text-[8px] uppercase tracking-wider border border-ember-800 rounded-sm px-2 py-0.5 text-ember-500 ${fresh ? "signal-card-enter" : ""}`}
                  style={fresh ? { animationDelay: animDelay } : undefined}
                >
                  {theme}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Patterns ─── */}
      {insights.patterns.length > 0 && (
        <div className="pb-3 border-b border-border/50">
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            Patterns
          </p>
          <div className="space-y-1.5">
            {insights.patterns.map((pattern) => {
              const fresh = isNew("pattern", pattern);
              const animDelay = fresh ? `${100 + newItemIndex++ * 120}ms` : "0ms";
              return (
                <div
                  key={pattern}
                  className={`pl-3 border-l-2 border-temp-warm text-ember-400 text-[11px] leading-relaxed ${fresh ? "signal-card-enter" : ""}`}
                  style={fresh ? { animationDelay: animDelay } : undefined}
                >
                  {pattern}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Values ─── */}
      {insights.values.length > 0 && (
        <div className="pb-3 border-b border-border/50">
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            Values
          </p>
          <div className="flex flex-wrap gap-1">
            {insights.values.map((v) => {
              const fresh = isNew("value", v);
              const animDelay = fresh ? `${100 + newItemIndex++ * 120}ms` : "0ms";
              return (
                <span
                  key={v}
                  className={`font-mono text-[8px] uppercase tracking-wider text-temp-cool/70 border border-temp-cool/20 rounded-sm px-2 py-0.5 ${fresh ? "signal-card-enter" : ""}`}
                  style={fresh ? { animationDelay: animDelay } : undefined}
                >
                  {v}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Strengths ─── */}
      {insights.strengths.length > 0 && (
        <div className="pb-3 border-b border-border/50">
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            Strengths
          </p>
          <div className="flex flex-wrap gap-1">
            {insights.strengths.map((s) => {
              const fresh = isNew("strength", s);
              const animDelay = fresh ? `${100 + newItemIndex++ * 120}ms` : "0ms";
              return (
                <span
                  key={s}
                  className={`font-mono text-[8px] uppercase tracking-wider text-temp-warm/70 border border-temp-warm/20 rounded-sm px-2 py-0.5 ${fresh ? "signal-card-enter" : ""}`}
                  style={fresh ? { animationDelay: animDelay } : undefined}
                >
                  {s}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Important People ─── */}
      {insights.identity?.importantPeople?.length > 0 && (
        <div className="pb-3 border-b border-border/50">
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            People
          </p>
          <div className="space-y-1">
            {insights.identity.importantPeople.map((p) => {
              const fresh = isNew("person", p.name);
              return (
                <div
                  key={p.name}
                  className={`flex items-baseline gap-2 ${fresh ? "signal-card-enter" : ""}`}
                >
                  <span className="text-ember-400 text-[11px]">{p.name}</span>
                  <span className="font-mono text-[8px] uppercase tracking-wider text-ember-700">
                    {p.relationship}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Action Items ─── */}
      {insights.actionItems.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ember-600 mb-2">
            Work On
          </p>
          <div className="space-y-2">
            {insights.actionItems.map((item) => {
              const done = item.status === "completed";
              const fresh = isNew("action", item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-2 ${done ? "opacity-50" : ""} ${fresh ? "signal-card-enter" : ""}`}
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
