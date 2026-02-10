"use client";

import { useRef, useEffect, useState } from "react";

export type MeltPhase = "idle" | "dissolving" | "crystallizing" | "settled";

const DISSOLVE_MS = 1200;
const TOTAL_MS = 2600;

/**
 * Tracks the null → non-null transition of NVC analysis and drives
 * the three-phase Melt animation: dissolve → crystallize → settled.
 *
 * If analysis is already present on mount (loaded from history),
 * the hook returns "settled" immediately — no animation plays.
 */
export function useMelt(analysisArrived: boolean): MeltPhase {
  const mountedWith = useRef(analysisArrived);
  const triggered = useRef(false);
  const [phase, setPhase] = useState<MeltPhase>(
    analysisArrived ? "settled" : "idle"
  );

  useEffect(() => {
    if (mountedWith.current || !analysisArrived || triggered.current) return;
    triggered.current = true;

    setPhase("dissolving");
    const t1 = setTimeout(() => setPhase("crystallizing"), DISSOLVE_MS);
    const t2 = setTimeout(() => setPhase("settled"), TOTAL_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [analysisArrived]);

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
