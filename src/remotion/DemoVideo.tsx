import {
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { AvaOrb } from "./AvaOrb";
import { Block1Open } from "./compositions/Block1Open";
import { Block2Core } from "./compositions/Block2Core";
import { Block3Intelligence } from "./compositions/Block3Intelligence";
import { Block4Entity } from "./compositions/Block4Entity";
import { Block5Close } from "./compositions/Block5Close";

export const DEMO_VIDEO_FPS = 30;
export const DEMO_VIDEO_DURATION_FRAMES = 4470; // 149s at 30fps

/**
 * DemoVideo — master 2:29 composition (tightened to match actual audio).
 *
 * Layout:
 *   Top 1/3:    AvaOrb — energy-reactive to current audio block
 *   Bottom 2/3: Content — screen recordings and text cards
 *
 * Timeline (at 30fps, based on actual ElevenLabs audio durations):
 *   Block 1: Open          0-300      (10s,  audio 7.9s)
 *   Block 2: Core          300-1860   (52s,  audio 49.3s)
 *   Block 3: Intelligence  1860-3030  (39s,  audio 36.8s)
 *   Block 4: Entity        3030-3840  (27s,  audio 24.5s)
 *   Block 5: Close         3840-4470  (21s,  audio 18.5s)
 */

/** Block timing config — derived from actual audio durations + padding */
const BLOCKS = [
  { src: "demo-audio/block-1-open.mp3", from: 0, duration: 300 },
  { src: "demo-audio/block-2-core.mp3", from: 300, duration: 1560 },
  { src: "demo-audio/block-3-intelligence.mp3", from: 1860, duration: 1170 },
  { src: "demo-audio/block-4-entity.mp3", from: 3030, duration: 810 },
  { src: "demo-audio/block-5-close.mp3", from: 3840, duration: 630 },
];

/**
 * Compute raw energy from visualizeAudio at a specific frame.
 * Returns 0 if the frame is out of bounds.
 */
function getRawEnergy(
  audioData: ReturnType<typeof useAudioData>,
  fps: number,
  relativeFrame: number
): number {
  if (!audioData || relativeFrame < 0) return 0;
  try {
    const visualization = visualizeAudio({
      fps,
      frame: relativeFrame,
      audioData,
      numberOfSamples: 256,
    });
    // Low frequencies (indices 0-7) for bass energy
    return visualization.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
  } catch {
    return 0;
  }
}

/**
 * OrbWithEnergy — loads ALL audio files upfront (stable React hooks),
 * selects the active one per frame, and applies a sliding-window average
 * to simulate the smooth energy interpolation from ParallaxOrb.
 *
 * The original uses: smoothEnergy += (target - smoothEnergy) * 0.08
 * At 60fps that's a ~200ms time constant. We simulate this with a
 * ±8 frame Gaussian-weighted moving average (~533ms window at 30fps).
 */
const OrbWithEnergy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Load all 5 audio files upfront — stable hook calls every render
  const audio0 = useAudioData(staticFile(BLOCKS[0].src));
  const audio1 = useAudioData(staticFile(BLOCKS[1].src));
  const audio2 = useAudioData(staticFile(BLOCKS[2].src));
  const audio3 = useAudioData(staticFile(BLOCKS[3].src));
  const audio4 = useAudioData(staticFile(BLOCKS[4].src));
  const allAudio = [audio0, audio1, audio2, audio3, audio4];

  // Find which block is active at this frame
  const blockIndex = BLOCKS.findIndex(
    (b) => frame >= b.from && frame < b.from + b.duration
  );

  let energy = 0;
  let waveformData: number[] | null = null;

  if (blockIndex >= 0 && allAudio[blockIndex]) {
    const audioData = allAudio[blockIndex]!;
    const blockStart = BLOCKS[blockIndex].from;
    const relativeFrame = frame - blockStart;

    // Sliding window average for smooth energy
    const WINDOW = 8;
    let weightedSum = 0;
    let totalWeight = 0;

    for (let offset = -WINDOW; offset <= WINDOW; offset++) {
      const sampleFrame = relativeFrame + offset;
      if (sampleFrame < 0) continue;

      const weight = 1 / (1 + Math.abs(offset) * 0.3);
      const raw = getRawEnergy(audioData, fps, sampleFrame);
      weightedSum += raw * weight;
      totalWeight += weight;
    }

    const smoothed = totalWeight > 0 ? weightedSum / totalWeight : 0;
    energy = Math.min(1, smoothed * 2.8);

    // Get the REAL frequency data for waveform rendering
    try {
      const visualization = visualizeAudio({
        fps,
        frame: relativeFrame,
        audioData,
        numberOfSamples: 128,
      });
      // Smooth the visualization data too — average with adjacent frames
      const vizPrev = relativeFrame > 0
        ? visualizeAudio({ fps, frame: relativeFrame - 1, audioData, numberOfSamples: 128 })
        : visualization;
      const vizNext = (() => {
        try {
          return visualizeAudio({ fps, frame: relativeFrame + 1, audioData, numberOfSamples: 128 });
        } catch { return visualization; }
      })();

      // Blend 3 frames for smoother waveform transitions
      waveformData = visualization.map((v, i) =>
        (vizPrev[i] * 0.25 + v * 0.5 + vizNext[i] * 0.25)
      );
    } catch {
      waveformData = null;
    }
  }

  // Fade the orb in during Block 1 opening
  const orbOpacity = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        opacity: orbOpacity,
      }}
    >
      <AvaOrb size={200} energy={energy} waveform={waveformData} particles />
    </div>
  );
};

export const DemoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0b08" }}>
      {/* -- Content layer (bottom 2/3) -- */}
      <AbsoluteFill style={{ top: "33.33%", height: "66.67%" }}>
        <Sequence from={0} durationInFrames={300}>
          <Block1Open />
        </Sequence>
        <Sequence from={300} durationInFrames={1560}>
          <Block2Core />
        </Sequence>
        <Sequence from={1860} durationInFrames={1170}>
          <Block3Intelligence />
        </Sequence>
        <Sequence from={3030} durationInFrames={810}>
          <Block4Entity />
        </Sequence>
        <Sequence from={3840} durationInFrames={630}>
          <Block5Close />
        </Sequence>
      </AbsoluteFill>

      {/* -- Orb layer (top 1/3, always visible) -- */}
      <AbsoluteFill style={{ height: "33.33%", bottom: "auto" }}>
        <OrbWithEnergy />
      </AbsoluteFill>

      {/* -- Audio tracks -- */}
      {BLOCKS.map((block) => (
        <Sequence
          key={block.src}
          from={block.from}
          durationInFrames={block.duration}
        >
          <Audio src={staticFile(block.src)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
