"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseVADOptions {
  /** RMS energy threshold to consider as speech (default: 0.01) */
  silenceThreshold?: number;
  /** Minimum speech duration to avoid false triggers like coughs (default: 300ms) */
  minSpeechDurationMs?: number;
}

export interface UseVADReturn {
  /** true when energy is above threshold */
  isSpeechDetected: boolean;
  /** Milliseconds of continuous silence since last speech */
  silenceDurationMs: number;
  /** Whether VAD is actively monitoring */
  isListening: boolean;
  /** Start monitoring mic audio */
  start: () => void;
  /** Stop monitoring and release mic */
  stop: () => void;
}

/**
 * Voice Activity Detection via Web Audio API.
 *
 * Captures mic audio → AnalyserNode → polls RMS energy at ~30fps.
 * Tracks speech→silence transitions with configurable thresholds.
 * Caller decides what "silence for N ms" means (e.g., auto-send).
 */
export function useVoiceActivityDetection(
  options: UseVADOptions = {}
): UseVADReturn {
  const {
    silenceThreshold = 0.01,
    minSpeechDurationMs = 300,
  } = options;

  const [isSpeechDetected, setIsSpeechDetected] = useState(false);
  const [silenceDurationMs, setSilenceDurationMs] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Float32Array<ArrayBuffer> | null>(null);

  // Temporal tracking refs (avoid re-renders on every frame)
  const speechStartRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const hasSpokeRef = useRef(false);

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

    const now = Date.now();
    const isSpeech = rms > silenceThreshold;

    if (isSpeech) {
      // Speech detected
      silenceStartRef.current = null;
      setSilenceDurationMs(0);

      if (!speechStartRef.current) {
        speechStartRef.current = now;
      }

      // Only mark as speech after minimum duration (filters coughs/clicks)
      const speechDuration = now - speechStartRef.current;
      if (speechDuration >= minSpeechDurationMs) {
        hasSpokeRef.current = true;
        setIsSpeechDetected(true);
      }
    } else {
      // Silence
      speechStartRef.current = null;

      if (hasSpokeRef.current) {
        // Only track silence duration after confirmed speech
        if (!silenceStartRef.current) {
          silenceStartRef.current = now;
        }
        const duration = now - silenceStartRef.current;
        setSilenceDurationMs(duration);
        setIsSpeechDetected(false);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [silenceThreshold, minSpeechDurationMs]);

  const start = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024; // Smaller than visualizer — we only need energy
      analyser.smoothingTimeConstant = 0.5;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      streamRef.current = stream;
      dataArrayRef.current = new Float32Array(analyser.fftSize);

      // Reset temporal state
      speechStartRef.current = null;
      silenceStartRef.current = null;
      hasSpokeRef.current = false;
      setIsSpeechDetected(false);
      setSilenceDurationMs(0);
      setIsListening(true);

      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setIsListening(false);
    }
  }, [tick]);

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
    analyserRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    dataArrayRef.current = null;
    speechStartRef.current = null;
    silenceStartRef.current = null;
    hasSpokeRef.current = false;

    setIsListening(false);
    setIsSpeechDetected(false);
    setSilenceDurationMs(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  return { isSpeechDetected, silenceDurationMs, isListening, start, stop };
}
