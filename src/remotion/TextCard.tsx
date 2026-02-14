import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface TextCardProps {
  /** Main text to display */
  text: string;
  /** Optional smaller subtext below */
  subtext?: string;
  /** Fade in duration in frames (default 15) */
  fadeInFrames?: number;
  /** Use teal accent color for text (default false — uses heading color) */
  accent?: boolean;
  /** Font size in px (default 32) */
  fontSize?: number;
}

/**
 * TextCard — styled text overlay for the demo video.
 *
 * Used for:
 * - Block 2A: "Professional mediation is expensive. Most people never get it."
 * - Block 5: URL card (parallax-ebon-three.vercel.app)
 *
 * Ember design tokens: #0f0b08 background, teal #6aab8e accent,
 * heading color #ebe1d4, Source Serif for headings.
 */
export const TextCard: React.FC<TextCardProps> = ({
  text,
  subtext,
  fadeInFrames = 15,
  accent = false,
  fontSize = 32,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, fadeInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [0, fadeInFrames], [20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0b08",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 120px",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          textAlign: "center",
          maxWidth: 1200,
        }}
      >
        <p
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize,
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: "-0.02em",
            color: accent ? "#6aab8e" : "#ebe1d4",
            margin: 0,
          }}
        >
          {text}
        </p>
        {subtext && (
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 16,
              fontWeight: 400,
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
              color: "#7a6c58",
              marginTop: 24,
            }}
          >
            {subtext}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};
