"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { AudioWaveformOrb } from "@/components/AudioWaveformOrb";

interface ParallaxPresenceProps {
  isAnalyzing: boolean;
  isSpeaking: boolean;
  statusLabel?: string;
  /** Real waveform data from useParallaxVoice — used when speaking */
  voiceWaveform?: Float32Array | null;
  /** Real energy level from useParallaxVoice — used when speaking */
  voiceEnergy?: number;
}

/**
 * Generates a synthetic waveform for visual feedback when the mic isn't active.
 * Returns a Float32Array with gentle sine-wave motion modulated by activity state.
 */
function useSyntheticWaveform(active: boolean): {
  waveform: Float32Array | null;
  energy: number;
} {
  const [waveform, setWaveform] = useState<Float32Array | null>(null);
  const [energy, setEnergy] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!active) {
      setWaveform(null);
      setEnergy(0);
      return;
    }

    let raf: number;

    function animate() {
      const t = (Date.now() - startRef.current) / 1000;
      const data = new Float32Array(1024);
      const targetEnergy = 0.3 + Math.sin(t * 1.5) * 0.15;

      for (let i = 0; i < 1024; i++) {
        const x = i / 1024;
        data[i] =
          Math.sin(x * Math.PI * 4 + t * 3) * 0.3 +
          Math.sin(x * Math.PI * 7 + t * 5) * 0.15 +
          Math.sin(x * Math.PI * 11 + t * 2) * 0.1;
      }

      setWaveform(data);
      setEnergy(targetEnergy);
      frameRef.current++;
      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return { waveform, energy };
}

export function ParallaxPresence({
  isAnalyzing,
  isSpeaking,
  statusLabel,
  voiceWaveform,
  voiceEnergy,
}: ParallaxPresenceProps) {
  const isActive = isAnalyzing || isSpeaking;
  // Use real voice waveform when speaking, synthetic when just analyzing
  const synthetic = useSyntheticWaveform(isActive && !isSpeaking);
  const waveform = isSpeaking && voiceWaveform ? voiceWaveform : synthetic.waveform;
  const energy = isSpeaking && voiceEnergy != null ? voiceEnergy : synthetic.energy;

  const effectiveLabel = useMemo(() => {
    if (statusLabel) return statusLabel;
    if (isSpeaking) return "Speaking...";
    if (isAnalyzing) return "Thinking...";
    return "Listening...";
  }, [statusLabel, isSpeaking, isAnalyzing]);

  return (
    <div className="flex flex-col items-center py-4">
      <AudioWaveformOrb
        name="Parallax"
        role="claude"
        waveform={waveform}
        energy={energy}
        active={isActive}
        size={80}
      />
      <span className="mt-2 font-mono text-[10px] uppercase tracking-widest text-temp-cool">
        {effectiveLabel}
      </span>
    </div>
  );
}
