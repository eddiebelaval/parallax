"use client";

import { useCurrentFrame, interpolate, Easing } from "remotion";

export const MELT_DEMO_FPS = 30;
export const MELT_DEMO_DURATION_FRAMES = 540; // 18 seconds at 30fps

const RAW_MESSAGE =
  "You always say you'll help but then nothing changes. I'm tired of being the only one who cares.";

const ANALYSIS = {
  temperature: 0.72,
  subtext:
    "I keep putting my trust in your promises and getting let down. I'm questioning whether my needs matter to you.",
  blindSpots:
    '"Always" and "only one who cares" erase any effort the other person has made.',
  unmetNeeds: "Partnership, reliability, to feel valued",
  nvcTranslation:
    "When we agree on something and it doesn't happen, I feel hurt and invisible. I need to know my time matters. Could we make a plan we both commit to?",
};

/**
 * Knuth hash for deterministic per-character scatter.
 * Same algorithm as TheMelt.tsx's particleProps.
 */
function charScatter(index: number, total: number) {
  const hash = (((index + 1) * 2654435761) >>> 0) % 997;
  const angle = ((hash % 360) * Math.PI) / 180;
  const distance = 12 + (hash % 48);
  return {
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance,
    delay: index / Math.max(total, 1),
  };
}

/**
 * MeltDemo — 18-second looping Remotion composition.
 *
 * Timeline (tightened front, extended hold):
 *   0-40:    Raw message types in character by character (faster)
 *   42-55:   Temperature badge fades in
 *   60-130:  Melt dissolve — characters scatter (Knuth hash pattern)
 *   140-260: Analysis crystallizes — subtext, blind spots, needs, NVC slide in
 *   260-480: Hold on full analysis (8+ seconds of reading time)
 *   480-540: Fade out for loop restart
 */
export const MeltDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const chars = RAW_MESSAGE.split("");

  // Phase calculations — tightened front half
  const typewriterProgress = interpolate(frame, [0, 38], [0, 1], {
    extrapolateRight: "clamp",
  });
  const visibleChars = Math.floor(typewriterProgress * chars.length);

  const tempBadgeOpacity = interpolate(frame, [42, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dissolveProgress = interpolate(frame, [60, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const analysisOpacity = interpolate(frame, [140, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [480, 535], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Show raw text phase (0-130)
  const showRaw = frame < 130;
  // Show analysis phase (140+)
  const showAnalysis = frame >= 140;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--ember-dark, #0f0b08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "24px 32px",
        fontFamily: "var(--font-sans, sans-serif)",
        opacity: fadeOut,
        overflow: "hidden",
      }}
    >
      {/* Raw message phase */}
      {showRaw && (
        <div>
          {/* Speaker label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--ember-accent, #d4a040)",
              }}
            >
              Person A
            </span>
            {/* Temperature badge */}
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 9,
                padding: "2px 8px",
                border: "1px solid",
                borderColor: `rgba(212, 160, 64, ${tempBadgeOpacity * 0.4})`,
                color: `rgba(212, 160, 64, ${tempBadgeOpacity})`,
                borderRadius: 2,
              }}
            >
              {ANALYSIS.temperature}
            </span>
          </div>

          {/* Characters with melt dissolve */}
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "var(--ember-heading, #ebe1d4)",
              margin: 0,
            }}
          >
            {chars.map((char, i) => {
              // Not yet typed
              if (i >= visibleChars && frame < 42) {
                return (
                  <span key={i} style={{ opacity: 0 }}>
                    {char}
                  </span>
                );
              }

              // During dissolve
              if (dissolveProgress > 0) {
                const { dx, dy, delay } = charScatter(i, chars.length);
                const charProgress = interpolate(
                  dissolveProgress,
                  [delay * 0.6, delay * 0.6 + 0.4],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );

                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      opacity: 1 - charProgress,
                      transform: `translate(${dx * charProgress}px, ${dy * charProgress}px) scale(${1 - charProgress * 0.7})`,
                      filter: `blur(${charProgress * 4}px)`,
                      color:
                        charProgress > 0.2
                          ? "var(--ember-accent, #d4a040)"
                          : "inherit",
                      whiteSpace: "pre",
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                );
              }

              return (
                <span key={i} style={{ whiteSpace: "pre" }}>
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            })}
          </p>
        </div>
      )}

      {/* Analysis crystallize phase */}
      {showAnalysis && (
        <div
          style={{
            opacity: analysisOpacity,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <AnalysisRow
            label="Subtext"
            text={ANALYSIS.subtext}
            frame={frame}
            startFrame={145}
          />
          <AnalysisRow
            label="Blind Spots"
            text={ANALYSIS.blindSpots}
            frame={frame}
            startFrame={170}
          />
          <AnalysisRow
            label="Unmet Needs"
            text={ANALYSIS.unmetNeeds}
            frame={frame}
            startFrame={195}
          />
          <AnalysisRow
            label="NVC Translation"
            text={ANALYSIS.nvcTranslation}
            frame={frame}
            startFrame={220}
            isCool
          />
        </div>
      )}
    </div>
  );
};

function AnalysisRow({
  label,
  text,
  frame,
  startFrame,
  isCool = false,
}: {
  label: string;
  text: string;
  frame: number;
  startFrame: number;
  isCool?: boolean;
}) {
  const opacity = interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(
    frame,
    [startFrame, startFrame + 20],
    [12, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var(--ember-muted, #7a6c58)",
          marginBottom: 3,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 12,
          lineHeight: 1.6,
          color: isCool
            ? "var(--temp-cool, #6aab8e)"
            : "var(--ember-text, #c9b9a3)",
          fontStyle: isCool ? "italic" : "normal",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}
