"use client";

import { useRef, useEffect, useState } from "react";

export type MeltPhase = "idle" | "dissolving" | "crystallizing" | "settled";

/**
 * V3: Severity-aware dissolve timing.
 * Low severity (0-0.3): fast dissolve — message was mild, quick transform.
 * High severity (0.7-1.0): slow dissolve — heavy message, let it breathe.
 */
function getMeltTiming(severity: number) {
  // Clamp to 0-1, map to 800ms-1800ms dissolve
  const s = Math.max(0, Math.min(1, severity));
  const dissolveMs = Math.round(800 + s * 1000);
  const crystallizeMs = Math.round(dissolveMs * 1.15); // crystallize slightly longer than dissolve
  return { dissolveMs, totalMs: dissolveMs + crystallizeMs };
}

/**
 * Tracks the null → non-null transition of NVC analysis and drives
 * the three-phase Melt animation: dissolve → crystallize → settled.
 *
 * If analysis is already present on mount (loaded from history),
 * the hook returns "settled" immediately — no animation plays.
 *
 * V3: Accepts optional severity for dynamic timing.
 */
export function useMelt(analysisArrived: boolean, severity = 0.5): MeltPhase {
  const mountedWith = useRef(analysisArrived);
  const triggered = useRef(false);
  const [phase, setPhase] = useState<MeltPhase>(
    analysisArrived ? "settled" : "idle"
  );

  useEffect(() => {
    if (mountedWith.current || !analysisArrived || triggered.current) return;
    triggered.current = true;

    const { dissolveMs, totalMs } = getMeltTiming(severity);

    setPhase("dissolving");
    const t1 = setTimeout(() => setPhase("crystallizing"), dissolveMs);
    const t2 = setTimeout(() => setPhase("settled"), totalMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [analysisArrived, severity]);

  return phase;
}

interface MeltTextProps {
  content: string;
  phase: MeltPhase;
  temperatureColor?: string;
  className?: string;
}

/**
 * Renders message text — normally in idle/settled states, or with a
 * character-level dissolve particle animation during The Melt.
 */
export function MeltText({
  content,
  phase,
  temperatureColor = "#eeeeee",
  className = "",
}: MeltTextProps) {
  if (phase !== "dissolving") {
    return (
      <p
        className={`${className} ${phase === "crystallizing" ? "melt-reform" : ""}`}
      >
        {content}
      </p>
    );
  }

  const chars = content.split("");

  return (
    <p className={className} aria-label={content}>
      {chars.map((char, i) => {
        const { dx, dy, delay } = particleProps(i, chars.length);
        return (
          <span
            key={i}
            className="melt-particle"
            aria-hidden="true"
            style={
              {
                "--melt-dx": dx,
                "--melt-dy": dy,
                "--melt-delay": `${delay}ms`,
                "--melt-color": temperatureColor,
              } as React.CSSProperties
            }
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </p>
  );
}

/**
 * Deterministic pseudo-random scatter props per character.
 * Uses Knuth multiplicative hash for even distribution
 * without Math.random() (hydration-safe).
 */
function particleProps(index: number, total: number) {
  const hash = (((index + 1) * 2654435761) >>> 0) % 997;
  const angle = ((hash % 360) * Math.PI) / 180;
  const distance = 12 + (hash % 48);

  return {
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance),
    delay: Math.round((index / Math.max(total, 1)) * 500 + (hash % 150)),
  };
}
