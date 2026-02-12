import { Composition } from "remotion";
import { MeltDemo, MELT_DEMO_DURATION_FRAMES, MELT_DEMO_FPS } from "./MeltDemo";

/**
 * Remotion entry point — registers all compositions.
 * Used by @remotion/player for in-page rendering and
 * by @remotion/cli for offline video export.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MeltDemo"
        component={MeltDemo}
        durationInFrames={MELT_DEMO_DURATION_FRAMES}
        fps={MELT_DEMO_FPS}
        width={640}
        height={360}
      />
    </>
  );
};
