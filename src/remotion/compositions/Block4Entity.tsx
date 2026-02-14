import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  staticFile,
  interpolate,
  useCurrentFrame,
} from "remotion";

/**
 * Block 4: The Entity (810 frames / 27s, audio 24.5s)
 *
 * Internal timeline:
 *   0-300:   4A — Presence: orb quick-cuts across 4 pages (one continuous recording)
 *   300-810: 4B — Three modes (three-doors, in-person, remote, solo)
 *
 * Pacing: fast cuts. Show that Ava is everywhere.
 */
export const Block4Entity: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0b08" }}>
      {/* 4A: Presence — orb on every page (quick-cuts recording) */}
      <Sequence from={0} durationInFrames={315}>
        <FadeShot>
          <OffthreadVideo
            src={staticFile("demo-shots/shot-14-orb-quick-cuts.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </FadeShot>
      </Sequence>

      {/* 4B: Three modes */}
      <Sequence from={300} durationInFrames={510}>
        <ThreeModes />
      </Sequence>
    </AbsoluteFill>
  );
};

const ThreeModes: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Shot 15: Three doors (0-75 = 2.5s) */}
      <Sequence from={0} durationInFrames={90}>
        <FadeShot fadeOutStart={75} fadeOutEnd={90}>
          <OffthreadVideo
            src={staticFile("demo-shots/shot-15-three-doors.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </FadeShot>
      </Sequence>

      {/* Shot 16: In-Person X-Ray (75-180 = 3.5s) */}
      <Sequence from={75} durationInFrames={120}>
        <FadeShot fadeOutStart={105} fadeOutEnd={120}>
          <OffthreadVideo
            src={staticFile("demo-shots/shot-16-in-person-mode.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </FadeShot>
      </Sequence>

      {/* Shot 17: Remote split-screen (180-285 = 3.5s) */}
      <Sequence from={180} durationInFrames={120}>
        <FadeShot fadeOutStart={105} fadeOutEnd={120}>
          <OffthreadVideo
            src={staticFile("demo-shots/shot-17-remote-mode.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </FadeShot>
      </Sequence>

      {/* Shot 18: Solo 1:1 (285-510) */}
      <Sequence from={285} durationInFrames={225}>
        <FadeShot>
          <OffthreadVideo
            src={staticFile("demo-shots/shot-18-solo-mode.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </FadeShot>
      </Sequence>
    </AbsoluteFill>
  );
};

const FadeShot: React.FC<{
  children: React.ReactNode;
  fadeOutStart?: number;
  fadeOutEnd?: number;
}> = ({ children, fadeOutStart, fadeOutEnd }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  let fadeOut = 1;
  if (fadeOutStart !== undefined && fadeOutEnd !== undefined) {
    fadeOut = interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      {children}
    </AbsoluteFill>
  );
};
