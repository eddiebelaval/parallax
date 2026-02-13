"use client";

import { useMemo } from "react";

interface AudioWaveformOrbProps {
  /** Participant name label */
  name: string;
  /** Role determines color: 'a' = accent (warm), 'b' = hot (rust), 'claude' = teal */
  role: "a" | "b" | "claude";
  /** Real-time waveform data from useAudioAnalyser (Float32Array, values -1 to 1) */
  waveform: Float32Array | null;
  /** RMS energy level 0-1 from useAudioAnalyser */
  energy: number;
  /** Whether mic is actively capturing */
  active: boolean;
  /** Size of the orb in pixels */
  size?: number;
}

const ROLE_COLORS = {
  a: { stroke: "var(--temp-warm)", glow: "var(--glow-warm)", glowSoft: "var(--glow-warm-soft)" },
  b: { stroke: "var(--temp-hot)", glow: "var(--glow-hot)", glowSoft: "var(--glow-hot-soft)" },
  claude: { stroke: "var(--temp-cool)", glow: "var(--glow-cool)", glowSoft: "var(--glow-cool-soft)" },
};

/**
 * Downsamples a waveform array to N control points and generates
 * a smooth SVG quadratic bezier path string.
 */
function waveformToPath(
  waveform: Float32Array,
  numPoints: number,
  width: number,
  height: number,
  amplitude: number,
): string {
  const centerY = height / 2;
  const step = Math.floor(waveform.length / numPoints);
  const sliceWidth = width / (numPoints - 1);

  // Sample control points
  const points: [number, number][] = [];
  for (let i = 0; i < numPoints; i++) {
    const idx = Math.min(i * step, waveform.length - 1);
    const x = i * sliceWidth;
    const y = centerY + waveform[idx] * amplitude;
    points.push([x, y]);
  }

  if (points.length < 2) return `M 0,${centerY} L ${width},${centerY}`;

  // Build smooth quadratic bezier path through all points
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev[0] + curr[0]) / 2;
    const midY = (prev[1] + curr[1]) / 2;
    d += ` Q ${prev[0]},${prev[1]} ${midX},${midY}`;
  }
  // Final line to last point
  const last = points[points.length - 1];
  d += ` L ${last[0]},${last[1]}`;

  return d;
}

/** Generates a gentle idle waveform path (sine wave) */
function idlePath(width: number, height: number, time: number): string {
  const centerY = height / 2;
  const points = 10;
  const sliceWidth = width / (points - 1);

  let d = `M 0,${centerY}`;
  for (let i = 1; i < points; i++) {
    const x = i * sliceWidth;
    const y = centerY + Math.sin((i / points) * Math.PI * 2 + time) * 3;
    const prevX = (i - 1) * sliceWidth;
    const prevY = centerY + Math.sin(((i - 1) / points) * Math.PI * 2 + time) * 3;
    const midX = (prevX + x) / 2;
    const midY = (prevY + y) / 2;
    d += ` Q ${prevX},${prevY} ${midX},${midY}`;
  }
  d += ` L ${width},${centerY}`;
  return d;
}

export function AudioWaveformOrb({
  name,
  role,
  waveform,
  energy,
  active,
  size = 64,
}: AudioWaveformOrbProps) {
  const colors = ROLE_COLORS[role];
  const waveWidth = size * 0.7;
  const waveHeight = size * 0.35;
  const amplitude = waveHeight * 0.4 * (1 + energy * 2);

  // Generate SVG path from waveform data or idle animation
  const pathD = useMemo(() => {
    if (waveform && active) {
      return waveformToPath(waveform, 12, waveWidth, waveHeight, amplitude);
    }
    // Idle: gentle sine wobble (static snapshot — the CSS animation handles motion)
    return idlePath(waveWidth, waveHeight, 0);
  }, [waveform, active, waveWidth, waveHeight, amplitude]);

  // Glow intensity scales with energy
  const glowRadius = 4 + energy * 12;
  const orbScale = 1 + energy * 0.06;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Orb container */}
      <div
        className={`relative flex items-center justify-center rounded-full ${!active ? "orb-idle" : ""}`}
        style={{
          width: size,
          height: size,
          transform: active ? `scale(${orbScale})` : undefined,
          transition: "transform 0.1s ease-out",
        }}
      >
        {/* Glow ring */}
        <div
          className={`absolute inset-0 rounded-full ${!active ? "orb-glow" : ""}`}
          style={{
            boxShadow: `0 0 ${glowRadius}px ${colors.glowSoft}, 0 0 ${glowRadius * 2}px ${colors.glowSoft}`,
            transition: "box-shadow 0.1s ease-out",
          }}
        />

        {/* Orb border ring */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="1.5"
            opacity={0.6 + energy * 0.4}
          />
        </svg>

        {/* Waveform SVG — centered inside the orb */}
        <svg
          width={waveWidth}
          height={waveHeight}
          viewBox={`0 0 ${waveWidth} ${waveHeight}`}
          className="relative z-10"
        >
          <path
            d={pathD}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={active ? 1 : 0.5}
          />
        </svg>
      </div>

      {/* Name label */}
      <span
        className="font-mono text-[9px] uppercase tracking-widest"
        style={{ color: colors.stroke }}
      >
        {name}
      </span>
    </div>
  );
}
