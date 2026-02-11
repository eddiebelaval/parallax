"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MicIcon } from "./icons";

// Chrome implements SpeechRecognition with webkit prefix
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

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

function isSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Check support after mount (SSR-safe)
  useEffect(() => {
    setSupported(isSupported());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (disabled || !isSupported()) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    finalTranscriptRef.current = "";
    setInterim("");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText) {
        finalTranscriptRef.current += finalText;
      }

      setInterim(finalTranscriptRef.current + interimText);
    };

    recognition.onerror = () => {
      setListening(false);
      setInterim("");
    };

    recognition.onend = () => {
      setListening(false);
      const result = finalTranscriptRef.current.trim();
      if (result) {
        onTranscriptRef.current(result);
      }
      setInterim("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [disabled]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const isDisabled = disabled || !supported;

  return (
    <div className={`px-4 py-3 ${isDisabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-3">
        {/* Push-to-talk button */}
        <button
          type="button"
          onMouseDown={supported ? startListening : undefined}
          onMouseUp={supported ? stopListening : undefined}
          onTouchStart={supported ? startListening : undefined}
          onTouchEnd={supported ? stopListening : undefined}
          onMouseLeave={listening ? stopListening : undefined}
          disabled={isDisabled}
          className="relative flex items-center justify-center w-11 h-11 rounded-full border border-border transition-colors hover:border-ember-600 disabled:opacity-40"
          aria-label={!supported ? "Voice requires Chrome" : listening ? "Listening..." : "Hold to speak"}
        >
          {/* Pulsing ring when active */}
          {listening && (
            <span className="absolute inset-0 rounded-full border-2 border-accent animate-pulse" />
          )}

          <MicIcon className={listening ? "text-accent" : "text-ember-500"} />
        </button>

        {/* Status label */}
        <div className="flex flex-col">
          <span className="font-mono text-xs uppercase tracking-wider text-ember-600">
            {!supported ? "Hold to speak" : listening ? "Listening..." : "Hold to speak"}
          </span>
          {!supported && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-ember-700 mt-0.5">
              Voice requires Chrome
            </span>
          )}
        </div>
      </div>

      {/* Interim transcript display */}
      {interim && (
        <div className="mt-2 px-1">
          <p className="font-mono text-sm text-foreground leading-relaxed">
            {interim}
          </p>
        </div>
      )}
    </div>
  );
}
