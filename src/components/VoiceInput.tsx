"use client";

import { useState, useRef, useCallback, useEffect } from "react";

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
        onTranscript(result);
      }
      setInterim("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [disabled, onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  if (!supported) {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-wider text-factory-gray-600">
          Voice not available in this browser
        </span>
      </div>
    );
  }

  return (
    <div className={`px-4 py-3 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-3">
        {/* Push-to-talk button */}
        <button
          type="button"
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          onMouseLeave={listening ? stopListening : undefined}
          disabled={disabled}
          className="relative flex items-center justify-center w-10 h-10 rounded-full border border-border transition-colors hover:border-factory-gray-600 disabled:opacity-40"
          aria-label={listening ? "Listening..." : "Hold to speak"}
        >
          {/* Pulsing ring when active */}
          {listening && (
            <span className="absolute inset-0 rounded-full border-2 border-accent animate-pulse" />
          )}

          {/* Mic icon SVG */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={listening ? "text-accent" : "text-factory-gray-500"}
          >
            <rect x="5.5" y="1" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 7.5C3 10.26 5.24 12.5 8 12.5C10.76 12.5 13 10.26 13 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="12.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5.5" y1="15" x2="10.5" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Status label */}
        <span className="font-mono text-xs uppercase tracking-wider text-factory-gray-600">
          {listening ? "Listening..." : "Hold to speak"}
        </span>
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
