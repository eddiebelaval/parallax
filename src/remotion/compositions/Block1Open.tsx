import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  OffthreadVideo,
  staticFile,
} from "remotion";

/**
 * Block 1: Open (0:00-0:10, 300 frames at 30fps)
 *
 * Timeline:
 *   0-60:    Black screen, orb fades in (handled by parent AvaOrb)
 *   60-120:  Title card "Parallax" fades in/out
 *   120-300: Landing page screen recording fades in
 *
 * The orb layer is rendered by the parent DemoVideo, not here.
 * This component handles the content area (bottom 2/3).
 */
export const Block1Open: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 1: Black screen with subtle "Parallax" text (frames 0-120)
  const titleOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleFadeOut = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: Landing page recording (frames 120-300)
  const landingOpacity = interpolate(frame, [120, 135], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const showTitle = frame < 130;
  const showLanding = frame >= 120;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0b08" }}>
      {/* Phase 1: Title card */}
      {showTitle && (
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: titleOpacity * titleFadeOut,
          }}
        >
          <p
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: 24,
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              color: "#7a6c58",
            }}
          >
            Parallax
          </p>
        </AbsoluteFill>
      )}

      {/* Phase 2: Landing page screen recording */}
      {showLanding && (
        <AbsoluteFill style={{ opacity: landingOpacity }}>
          <OffthreadVideo
            src={staticFile("demo-shots/shot-02-landing-page.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
