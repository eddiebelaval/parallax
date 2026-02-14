import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  staticFile,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { TextCard } from "../TextCard";

/**
 * Block 2: The Core Experience (1560 frames / 52s, audio 49.3s)
 *
 * Tightened internal timeline (proportional to actual speech pacing):
 *   0-240:     2A — Text card: "Professional mediation is expensive..."
 *   240-570:   2B — Raw message recording (heated message in X-Ray session)
 *   570-1170:  2C — The Melt hero shot — HOLD, let it breathe
 *   1170-1560: 2D — Conversation evolves (timer, turn switch, Ava intervenes)
 *
 * 15-frame crossfade dissolves between sub-blocks.
 */
export const Block2Core: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0b08" }}>
      {/* 2A: Text card — the problem statement */}
      <Sequence from={0} durationInFrames={255}>
        <FadeWrapper fadeOutStart={225} fadeOutEnd={240}>
          <TextCard
            text="Professional mediation is expensive. Most people never get it."
            subtext="I'm here to change that."
            fontSize={36}
          />
        </FadeWrapper>
      </Sequence>

      {/* 2B: Raw message — heated message in session */}
      <Sequence from={240} durationInFrames={345}>
        <FadeWrapper fadeInEnd={15} fadeOutStart={315} fadeOutEnd={330}>
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile("demo-shots/shot-04-heated-message.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </AbsoluteFill>
        </FadeWrapper>
      </Sequence>

      {/* 2C: The Melt — HERO SHOT — hold long, let it breathe */}
      <Sequence from={570} durationInFrames={615}>
        <FadeWrapper fadeInEnd={15} fadeOutStart={585} fadeOutEnd={600}>
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile("demo-shots/shot-05-the-melt.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </AbsoluteFill>
        </FadeWrapper>
      </Sequence>

      {/* 2D: Conversation evolves — timer, turn switch, Signal Rail */}
      <Sequence from={1170} durationInFrames={390}>
        <FadeWrapper fadeInEnd={15}>
          <ConversationMontage />
        </FadeWrapper>
      </Sequence>
    </AbsoluteFill>
  );
};

const FadeWrapper: React.FC<{
  children: React.ReactNode;
  fadeInEnd?: number;
  fadeOutStart?: number;
  fadeOutEnd?: number;
}> = ({ children, fadeInEnd = 0, fadeOutStart, fadeOutEnd }) => {
  const frame = useCurrentFrame();

  let opacity = 1;
  if (fadeInEnd > 0) {
    opacity *= interpolate(frame, [0, fadeInEnd], [0, 1], {
      extrapolateRight: "clamp",
    });
  }
  if (fadeOutStart !== undefined && fadeOutEnd !== undefined) {
    opacity *= interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/**
 * Conversation montage — sub-shots for Block 2D (390 frames / 13s).
 */
const ConversationMontage: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0b08" }}>
      {/* Shot 7: Timer, turn switch, Ava intervenes (0-150 = 5s) */}
      <Sequence from={0} durationInFrames={165}>
        <FadeWrapper fadeOutStart={135} fadeOutEnd={150}>
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile("demo-shots/shot-07-turn-mechanics.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </AbsoluteFill>
        </FadeWrapper>
      </Sequence>

      {/* Shot 8: Signal Rail temperature (150-240 = 3s) */}
      <Sequence from={150} durationInFrames={105}>
        <FadeWrapper fadeInEnd={15} fadeOutStart={75} fadeOutEnd={90}>
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile("demo-shots/shot-08-signal-rail.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </AbsoluteFill>
        </FadeWrapper>
      </Sequence>

      {/* Shot 9: Full X-Ray Glance view (240-390 = 5s) */}
      <Sequence from={240} durationInFrames={150}>
        <FadeWrapper fadeInEnd={15}>
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile("demo-shots/shot-09-xray-glance.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </AbsoluteFill>
        </FadeWrapper>
      </Sequence>
    </AbsoluteFill>
  );
};
