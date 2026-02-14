import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  staticFile,
  interpolate,
  useCurrentFrame,
} from "remotion";

/**
 * Block 5: The Build + Close (630 frames / 21s, audio 18.5s)
 *
 * Internal timeline:
 *   0-90:    GitHub + tests montage (3s)
 *   90-330:  Final orb breathing (8s) — orb handled by parent, content shows recording
 *   330-540: URL card fades in + holds
 *   540-630: Everything fades to black
 *
 * Pacing: quiet. The montage is fast, then silence.
 * The closing line lands in stillness.
 */
export const Block5Close: React.FC = () => {
  const frame = useCurrentFrame();

  // Final fade to black
  const fadeToBlack = interpolate(frame, [540, 620], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0b08", opacity: fadeToBlack }}>
      {/* Shot 19: GitHub + tests montage (0-90 = 3s) */}
      <Sequence from={0} durationInFrames={105}>
        <MontageShot />
      </Sequence>

      {/* Shot 20 + URL: Final orb breathing + URL card */}
      <Sequence from={90} durationInFrames={540}>
        <FinalSequence />
      </Sequence>
    </AbsoluteFill>
  );
};

const MontageShot: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <OffthreadVideo
        src={staticFile("demo-shots/shot-19-github-montage.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </AbsoluteFill>
  );
};

const FinalSequence: React.FC = () => {
  const frame = useCurrentFrame();

  // Orb recording fades in, then out as URL takes over
  const orbOpacity = interpolate(frame, [0, 15, 210, 240], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlOpacity = interpolate(frame, [240, 270], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlTranslateY = interpolate(frame, [240, 270], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0b08" }}>
      {/* Final orb breathing — screen recording of the landing page orb */}
      <AbsoluteFill style={{ opacity: orbOpacity }}>
        <OffthreadVideo
          src={staticFile("demo-shots/shot-20-final-orb.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </AbsoluteFill>

      {/* URL card fades in over the orb */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 120,
        }}
      >
        <div
          style={{
            opacity: urlOpacity,
            transform: `translateY(${urlTranslateY}px)`,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 20,
              color: "#6aab8e",
              letterSpacing: "0.05em",
            }}
          >
            parallax-ebon-three.vercel.app
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
