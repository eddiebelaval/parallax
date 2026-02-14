import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  staticFile,
  interpolate,
  useCurrentFrame,
} from "remotion";

/**
 * Block 3: The Intelligence (1170 frames / 39s, audio 36.8s)
 *
 * Internal timeline:
 *   0-510:    3A — Interview (Ava asking questions + profile dashboard)
 *   510-1170: 3B — 14 Lenses (LensGrid + NVC analysis in session)
 *
 * Pacing: faster than Block 2. Show range, not depth.
 */
export const Block3Intelligence: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0b08" }}>
      {/* 3A: The Interview */}
      <Sequence from={0} durationInFrames={525}>
        <InterviewSection />
      </Sequence>

      {/* 3B: The 14 Lenses */}
      <Sequence from={510} durationInFrames={660}>
        <LensSection />
      </Sequence>
    </AbsoluteFill>
  );
};

const InterviewSection: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [495, 510], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      {/* Shot 10: Interview page (0-210 = 7s) */}
      <Sequence from={0} durationInFrames={225}>
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile("demo-shots/shot-10-interview.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Shot 11: Profile dashboard (210-525 = ~10s) */}
      <Sequence from={210} durationInFrames={315}>
        <FadeIn>
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile("demo-shots/shot-11-profile-dashboard.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </AbsoluteFill>
        </FadeIn>
      </Sequence>
    </AbsoluteFill>
  );
};

const LensSection: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      {/* Shot 12: LensGrid (0-300 = 10s) */}
      <Sequence from={0} durationInFrames={315}>
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile("demo-shots/shot-12-lens-grid.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* NVC analysis in session — shows intelligence applied live (300-660) */}
      <Sequence from={300} durationInFrames={360}>
        <FadeIn>
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile("demo-shots/shot-06-nvc-analysis.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </AbsoluteFill>
        </FadeIn>
      </Sequence>
    </AbsoluteFill>
  );
};

const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
