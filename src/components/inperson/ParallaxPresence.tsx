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
    <div className="relative flex flex-col items-center py-6 flex-shrink-0">
      {/* Scanning beam effect when analyzing */}
      {isAnalyzing && (
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-temp-cool to-transparent scanning-beam"
          />
        </div>
      )}

      {/* Central orb */}
      <div className="relative">
        {/* Outer pulse rings when active */}
        {isActive && (
          <>
            <div
              className="absolute inset-[-16px] rounded-full border border-temp-cool/30 animate-ping"
              style={{ animationDuration: "2s" }}
            />
            <div
              className="absolute inset-[-24px] rounded-full border border-temp-cool/20 animate-ping"
              style={{ animationDuration: "3s", animationDelay: "0.5s" }}
            />
          </>
        )}
        <AudioWaveformOrb
          name="Parallax"
          role="claude"
          waveform={waveform}
          energy={energy}
          active={isActive}
          size={80}
        />
      </div>

      {/* Status label with glow */}
      <div className="mt-3 flex items-center gap-2">
        <div className="relative">
          <span className="w-1 h-1 rounded-full bg-temp-cool" />
          {isActive && (
            <span className="absolute inset-0 w-1 h-1 rounded-full bg-temp-cool animate-ping" />
          )}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-temp-cool">
          {effectiveLabel}
        </span>
      </div>

      {/* X-Ray Vision subtitle when analyzing */}
      {isAnalyzing && (
        <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-ember-500 animate-pulse">
          Seeing beneath the surface
        </span>
      )}
    </div>
  );
}
