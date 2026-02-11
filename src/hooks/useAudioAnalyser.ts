"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface AudioAnalyserState {
  /** Normalized waveform data (values -1 to 1), updated every frame */
  waveform: Float32Array | null;
  /** RMS energy level (0 to 1) — useful for glow intensity */
  energy: number;
  /** Whether the analyser is actively reading mic data */
  active: boolean;
  /** Whether mic permission was denied */
  denied: boolean;
  /** Start reading from mic */
  start: () => void;
  /** Stop reading from mic */
  stop: () => void;
}

/**
 * Web Audio API hook that captures microphone input and provides
 * real-time waveform data for visualization.
 *
 * Uses getUserMedia → AudioContext → AnalyserNode → requestAnimationFrame loop.
 * Returns normalized waveform array and energy level at ~60fps.
 */
export function useAudioAnalyser(fftSize = 2048): AudioAnalyserState {
  const [active, setActive] = useState(false);
  const [denied, setDenied] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [waveform, setWaveform] = useState<Float32Array | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Float32Array<ArrayBuffer> | null>(null);

  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (!analyser || !dataArray) return;

    analyser.getFloatTimeDomainData(dataArray);

    // Calculate RMS energy
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sumSquares += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    // Normalize to 0-1 range (typical speech RMS is 0.01-0.3)
    const normalizedEnergy = Math.min(1, rms * 5);

    setEnergy(normalizedEnergy);
    // Create a new Float32Array copy so React detects the state change
    setWaveform(new Float32Array(dataArray));

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      // Don't connect analyser to destination — we don't want to play back the mic

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      streamRef.current = stream;
      dataArrayRef.current = new Float32Array(analyser.fftSize);

      setActive(true);
      setDenied(false);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      // Permission denied or no mic available
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setDenied(true);
      }
      setActive(false);
    }
  }, [fftSize, tick]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    dataArrayRef.current = null;
    setActive(false);
    setWaveform(null);
    setEnergy(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  return { waveform, energy, active, denied, start, stop };
}
