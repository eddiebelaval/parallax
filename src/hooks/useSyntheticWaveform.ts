"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SyntheticWaveformState {
  waveform: Float32Array | null;
  energy: number;
  active: boolean;
}

/**
 * Generates a synthetic waveform for Claude's orb — no mic needed.
 *
 * When active, produces a complex multi-harmonic pattern that looks
 * like "thinking" — overlapping sine waves at different frequencies
 * with evolving amplitude. Designed to feel organic and distinct
 * from human speech waveforms.
 */
export function useSyntheticWaveform(isActive: boolean): SyntheticWaveformState {
  const [waveform, setWaveform] = useState<Float32Array | null>(null);
  const [energy, setEnergy] = useState(0);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const size = 256;
    const data = new Float32Array(size);

    // Multi-harmonic "thinking" pattern
    // 3 overlapping frequencies + amplitude modulation
    const baseFreq = 2.0;
    const ampMod = 0.5 + 0.5 * Math.sin(elapsed * 0.8); // slow breathing

    for (let i = 0; i < size; i++) {
      const t = (i / size) * Math.PI * 2;
      const signal =
        Math.sin(t * baseFreq + elapsed * 3) * 0.3 * ampMod +
        Math.sin(t * baseFreq * 2.3 + elapsed * 5) * 0.2 * ampMod +
        Math.sin(t * baseFreq * 3.7 + elapsed * 2) * 0.15 * ampMod;
      data[i] = signal;
    }

    setWaveform(data);
    setEnergy(0.25 + 0.2 * ampMod);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
      setWaveform(null);
      setEnergy(0);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, tick]);

  return { waveform, energy, active: isActive };
}
