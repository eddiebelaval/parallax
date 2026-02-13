"use client";

import { useEffect } from "react";
import { useAudioAnalyser } from "@/hooks/useAudioAnalyser";
import { useSyntheticWaveform } from "@/hooks/useSyntheticWaveform";
import { AudioWaveformOrb } from "./_deprecated/AudioWaveformOrb";
import type { MessageSender } from "@/types/database";

interface OrbStripProps {
  personAName: string;
  personBName: string;
  currentTurn: MessageSender | null;
  isAnalyzing: boolean;
}

/**
 * Shared presence strip showing all participants' orbs.
 *
 * Uses a single mic analyser (same-device mode = one mic) and routes
 * the waveform data to whichever person's turn it is. The inactive
 * speaker shows the idle animation. Claude's orb uses a synthetic
 * multi-harmonic waveform during NVC analysis.
 */
export function OrbStrip({
  personAName,
  personBName,
  currentTurn,
  isAnalyzing,
}: OrbStripProps) {
  const analyser = useAudioAnalyser();
  const claude = useSyntheticWaveform(isAnalyzing);

  // Request mic access once on mount — user can deny and orbs fall back to idle
  useEffect(() => {
    analyser.start();
    return () => analyser.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Route waveform to active speaker only
  const isATurn = currentTurn === "person_a";
  const isBTurn = currentTurn === "person_b";

  return (
    <div className="flex items-center justify-center gap-8 px-4 py-3 border-b border-border">
      <AudioWaveformOrb
        name={personAName}
        role="a"
        waveform={isATurn ? analyser.waveform : null}
        energy={isATurn ? analyser.energy : 0}
        active={isATurn && analyser.active}
        size={52}
      />
      <AudioWaveformOrb
        name="Parallax"
        role="claude"
        waveform={claude.waveform}
        energy={claude.energy}
        active={claude.active}
        size={52}
      />
      <AudioWaveformOrb
        name={personBName}
        role="b"
        waveform={isBTurn ? analyser.waveform : null}
        energy={isBTurn ? analyser.energy : 0}
        active={isBTurn && analyser.active}
        size={52}
      />
    </div>
  );
}
