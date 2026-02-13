"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useVoiceActivityDetection } from "./useVoiceActivityDetection";

// Web Speech API types (Chrome webkit prefix)
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
    SpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export interface UseAutoListenProps {
  /** Is auto-listen mode active? */
  enabled: boolean;
  /** Is Parallax TTS currently playing? Gates mic to prevent feedback. */
  isTTSPlaying: boolean;
  /** Called when speech finishes (silence detected) with the transcript */
  onTranscript: (text: string) => void;
  /** How long silence means "done speaking" (default: 2000ms) */
  silenceTimeoutMs?: number;
}

export interface UseAutoListenReturn {
  /** Mic is actively listening */
  isListening: boolean;
  /** Live transcript preview (interim + final) */
  interimText: string;
  /** User is currently talking (VAD detects energy) */
  isSpeechActive: boolean;
  /** Seconds until auto-send (0 = not counting down) */
  silenceCountdown: number;
  /** Whether Web Speech API is supported */
  isSupported: boolean;
}

function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function useAutoListen({
  enabled,
  isTTSPlaying,
  onTranscript,
  silenceTimeoutMs = 2000,
}: UseAutoListenProps): UseAutoListenReturn {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);
  const enabledRef = useRef(enabled);
  const isTTSRef = useRef(isTTSPlaying);
  const isStoppingRef = useRef(false);
  const silenceTimeoutRef = useRef(silenceTimeoutMs);

  // VAD for silence detection
  const vad = useVoiceActivityDetection({
    silenceThreshold: 0.01,
    minSpeechDurationMs: 300,
  });

  // Keep refs fresh
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    isTTSRef.current = isTTSPlaying;
  }, [isTTSPlaying]);

  useEffect(() => {
    silenceTimeoutRef.current = silenceTimeoutMs;
  }, [silenceTimeoutMs]);

  useEffect(() => {
    setIsSupported(isSpeechSupported());
  }, []);

  // Start speech recognition + VAD
  const startListening = useCallback(() => {
    if (!isSpeechSupported() || isTTSRef.current) return;

    isStoppingRef.current = false;
    finalTranscriptRef.current = "";
    setInterimText("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        finalTranscriptRef.current += final;
      }

      setInterimText(finalTranscriptRef.current + interim);
    };

    recognition.onerror = (event) => {
      // "no-speech" is expected — Chrome fires this when nobody talks for a while
      if (event.error === "no-speech" || event.error === "aborted") return;
      setIsListening(false);
    };

    recognition.onend = () => {
      // Chrome kills continuous recognition after ~30s of silence.
      // Auto-restart if we're still supposed to be listening.
      if (
        enabledRef.current &&
        !isTTSRef.current &&
        !isStoppingRef.current
      ) {
        try {
          recognition.start();
        } catch {
          // Already started or disposed — ignore
          setIsListening(false);
        }
        return;
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
      vad.start();
    } catch {
      setIsListening(false);
    }
  }, [vad]);

  // Stop recognition + VAD, optionally send transcript
  const stopListening = useCallback(
    (sendTranscript: boolean) => {
      isStoppingRef.current = true;

      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.abort();
        } catch {
          // Already stopped
        }
        recognitionRef.current = null;
      }

      vad.stop();
      setIsListening(false);

      if (sendTranscript) {
        const text = finalTranscriptRef.current.trim();
        if (text) {
          onTranscriptRef.current(text);
        }
      }

      finalTranscriptRef.current = "";
      setInterimText("");
    },
    [vad]
  );

  // Auto-start/stop based on enabled + TTS state
  useEffect(() => {
    if (enabled && !isTTSPlaying && !isListening && isSupported) {
      startListening();
    } else if ((!enabled || isTTSPlaying) && isListening) {
      // Stop without sending — TTS interruption or mode change
      stopListening(false);
    }
  }, [enabled, isTTSPlaying, isListening, isSupported, startListening, stopListening]);

  // Silence detection → auto-send
  useEffect(() => {
    if (
      vad.silenceDurationMs >= silenceTimeoutMs &&
      isListening &&
      finalTranscriptRef.current.trim()
    ) {
      stopListening(true);
    }
  }, [vad.silenceDurationMs, silenceTimeoutMs, isListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.abort();
        } catch {
          // Already stopped
        }
      }
    };
  }, []);

  // Calculate silence countdown (seconds remaining until auto-send)
  const silenceCountdown =
    vad.silenceDurationMs > 0 && isListening && finalTranscriptRef.current.trim()
      ? Math.max(
          0,
          Math.ceil((silenceTimeoutMs - vad.silenceDurationMs) / 1000)
        )
      : 0;

  return {
    isListening,
    interimText,
    isSpeechActive: vad.isSpeechDetected,
    silenceCountdown,
    isSupported,
  };
}
