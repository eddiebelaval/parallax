"use client";

import { Player } from "@remotion/player";
import { MeltDemo, MELT_DEMO_DURATION_FRAMES, MELT_DEMO_FPS } from "@/remotion/MeltDemo";

/**
 * MeltDemoPlayer — wraps the Remotion Player for embedding in the landing page.
 * Lazy-loaded via next/dynamic to keep the initial bundle lean.
 * Loops infinitely, no controls (atmospheric, not interactive).
 */
export default function MeltDemoPlayer() {
  return (
    <Player
      component={MeltDemo}
      durationInFrames={MELT_DEMO_DURATION_FRAMES}
      fps={MELT_DEMO_FPS}
      compositionWidth={640}
      compositionHeight={360}
      loop
      autoPlay
      style={{
        width: "100%",
        aspectRatio: "16/9",
      }}
    />
  );
}
