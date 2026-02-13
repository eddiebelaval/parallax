"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MicIcon, KeyboardIcon } from "@/components/icons";

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

type BarMode = "voice" | "text";

interface ActiveSpeakerBarProps {
  activeSpeakerName: string;
  onSend: (content: string) => void;
  disabled?: boolean;
  onMicStateChange?: (hot: boolean) => void;
  /** Show "Not your turn" message when false */
  isYourTurn?: boolean;
  /** Time remaining in current turn (ms), optional visual indicator */
  timeRemaining?: number;
}

function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function ActiveSpeakerBar({
  activeSpeakerName,
  onSend,
  disabled = false,
  onMicStateChange,
  isYourTurn = true,
  timeRemaining,
}: ActiveSpeakerBarProps) {
  const [mode, setMode] = useState<BarMode>("voice");
  const [micHot, setMicHot] = useState(false);
  const [interim, setInterim] = useState("");
  const [textValue, setTextValue] = useState("");
  const [dictating, setDictating] = useState(false);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const onSendRef = useRef(onSend);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onSendRef.current = onSend;
  }, [onSend]);

  useEffect(() => {
    setSupported(isSpeechSupported());
  }, []);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // Notify parent of mic state changes
  useEffect(() => {
    onMicStateChange?.(micHot || dictating);
  }, [micHot, dictating, onMicStateChange]);

  // --- Voice mode: tap to start, tap to stop, auto-send ---
  const startVoice = useCallback(() => {
    if (disabled || !isSpeechSupported()) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
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
      setMicHot(false);
      setInterim("");
    };

    recognition.onend = () => {
      setMicHot(false);
      const result = finalTranscriptRef.current.trim();
      if (result) {
        onSendRef.current(result);
      }
      setInterim("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setMicHot(true);
  }, [disabled]);

  const stopVoice = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (micHot) {
      stopVoice();
    } else {
      startVoice();
    }
  }, [micHot, startVoice, stopVoice]);

  // --- Text mode: dictation into text box ---
  const startDictation = useCallback(() => {
    if (disabled || !isSpeechSupported()) {
      // Fallback: just focus the text input for native keyboard dictation
      textInputRef.current?.focus();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    finalTranscriptRef.current = textValue; // Append to existing text
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
        setTextValue(finalTranscriptRef.current);
      }

      setInterim(interimText);
    };

    recognition.onerror = () => {
      setDictating(false);
      setInterim("");
    };

    recognition.onend = () => {
      setDictating(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setDictating(true);
  }, [disabled, textValue]);

  const stopDictation = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handleTextSend = useCallback(() => {
    const trimmed = textValue.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setTextValue("");
  }, [textValue, disabled, onSend]);

  const isRecording = micHot || dictating;

  // Format time remaining
  const timeRemainingSeconds = timeRemaining ? Math.ceil(timeRemaining / 1000) : null;
  const showUrgentWarning = timeRemainingSeconds !== null && timeRemainingSeconds <= 30;

  // If voice not supported, default to text
  useEffect(() => {
    if (!supported && mode === "voice") {
      setMode("text");
    }
  }, [supported, mode]);

  return (
    <div
      className={`border-t transition-all duration-300 flex-shrink-0 ${
        isRecording
          ? "border-temp-cool mic-hot-glow"
          : showUrgentWarning
          ? "border-temp-hot"
          : "border-border"
      }`}
    >
      {/* Urgent time warning */}
      {showUrgentWarning && (
        <div className="px-4 py-1 bg-temp-hot/10 border-b border-temp-hot/20">
          <span className="font-mono text-[10px] uppercase tracking-widest text-temp-hot animate-pulse">
            {timeRemainingSeconds}s remaining — wrap up your point
          </span>
        </div>
      )}

      {mode === "voice" ? (
        // ─── VOICE MODE: Tap to Talk ───
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Switch to text */}
            <button
              onClick={() => setMode("text")}
              disabled={disabled || micHot}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] text-ember-500 hover:text-foreground transition-colors disabled:opacity-40"
              aria-label="Switch to text input"
            >
              <KeyboardIcon size={14} />
            </button>

            {/* Tap to Talk / Stop button */}
            <button
              onClick={toggleVoice}
              disabled={disabled}
              className={`flex-1 flex items-center justify-center gap-3 min-h-[52px] rounded-lg border transition-all duration-200 ${
                micHot
                  ? "bg-temp-cool/10 border-temp-cool text-temp-cool"
                  : "bg-surface border-border text-ember-500 hover:border-ember-600 hover:text-foreground active:bg-ember-elevated"
              }`}
              aria-label={micHot ? "Tap to stop and send" : "Tap to talk"}
            >
              {/* Mic icon */}
              <div className="relative">
                {micHot && (
                  <span className="absolute inset-[-6px] rounded-full border-2 border-temp-cool animate-ping opacity-30" />
                )}
                <MicIcon
                  size={micHot ? 20 : 16}
                  className={`transition-all duration-200 ${
                    micHot ? "text-temp-cool" : ""
                  }`}
                />
              </div>

              <span className="font-mono text-xs uppercase tracking-widest">
                {micHot ? "Tap to send" : "Tap to talk"}
              </span>
            </button>

            {/* Mic state + speaker name */}
            <div className="flex flex-col items-end gap-0.5 min-w-[60px]">
              {micHot && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-temp-cool mic-live-pulse">
                  Mic live
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600">
                  {activeSpeakerName}
                </span>
              </div>
            </div>
          </div>

          {/* Interim transcript */}
          {interim && (
            <div className="mt-2 px-1 pb-1">
              <p className="font-mono text-sm text-foreground/80 leading-relaxed">
                {interim}
              </p>
            </div>
          )}
        </div>
      ) : (
        // ─── TEXT MODE: Input with dictation mic ───
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Switch to voice */}
            {supported && (
              <button
                onClick={() => {
                  if (dictating) stopDictation();
                  setMode("voice");
                }}
                disabled={disabled}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] text-ember-500 hover:text-foreground transition-colors disabled:opacity-40"
                aria-label="Switch to voice input"
              >
                <MicIcon size={14} />
              </button>
            )}

            {/* Text input with inline dictation mic */}
            <div
              className={`flex-1 flex items-center gap-2 px-3 min-h-[44px] rounded-lg border transition-all duration-200 ${
                dictating
                  ? "border-temp-cool bg-temp-cool/5"
                  : "border-border bg-surface"
              }`}
            >
              <input
                ref={textInputRef}
                type="text"
                value={dictating ? textValue + (interim ? " " + interim : "") : textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
                placeholder={`${activeSpeakerName}, speak your truth...`}
                disabled={disabled || dictating}
                className="flex-1 bg-transparent text-foreground text-sm placeholder:text-ember-600 focus:outline-none disabled:opacity-60"
              />

              {/* Inline dictation mic button */}
              {supported && (
                <button
                  onClick={dictating ? stopDictation : startDictation}
                  disabled={disabled}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                    dictating
                      ? "bg-temp-cool/20 text-temp-cool"
                      : "text-ember-500 hover:text-foreground hover:bg-ember-elevated"
                  }`}
                  aria-label={dictating ? "Stop dictation" : "Dictate to text box"}
                >
                  <div className="relative">
                    {dictating && (
                      <span className="absolute inset-[-4px] rounded-full border border-temp-cool animate-ping opacity-30" />
                    )}
                    <MicIcon size={12} className={dictating ? "text-temp-cool" : ""} />
                  </div>
                </button>
              )}
            </div>

            {/* Send button */}
            <button
              onClick={handleTextSend}
              disabled={disabled || !textValue.trim()}
              className="px-4 min-h-[44px] font-mono text-xs uppercase tracking-wider text-accent hover:text-ember-accent transition-colors disabled:opacity-40 disabled:hover:text-accent"
            >
              Send
            </button>

            {/* Speaker indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600 whitespace-nowrap">
                {activeSpeakerName}
              </span>
            </div>
          </div>

          {/* Dictation state indicator */}
          {dictating && (
            <div className="mt-1.5 px-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-temp-cool mic-live-pulse">
                Dictating — tap mic to stop
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
