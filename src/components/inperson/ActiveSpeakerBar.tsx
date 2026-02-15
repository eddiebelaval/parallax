"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MicIcon, MicOffIcon, KeyboardIcon } from "@/components/icons";
import { useSettings } from "@/hooks/useSettings";

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

type BarMode = "voice" | "text" | "auto";

interface AutoListenState {
  isListening: boolean;
  interimText: string;
  isSpeechActive: boolean;
  silenceCountdown: number;
}

interface ActiveSpeakerBarProps {
  activeSpeakerName: string;
  onSend: (content: string) => void;
  disabled?: boolean;
  onMicStateChange?: (hot: boolean) => void;
  /** Show "Not your turn" message when false */
  isYourTurn?: boolean;
  /** Time remaining in current turn (ms), optional visual indicator */
  timeRemaining?: number;
  /** Enable hands-free auto-listen mode (overrides voice/text toggle) */
  autoListen?: boolean;
  /** State from useAutoListen hook when autoListen is true */
  autoListenState?: AutoListenState;
  /** Whether Parallax TTS is currently speaking */
  isTTSSpeaking?: boolean;
  /** Whether any processing is happening (analyzing/loading) */
  isProcessing?: boolean;
  /** Whether mic is muted in hands-free mode */
  isMuted?: boolean;
  /** Toggle mute callback */
  onToggleMute?: () => void;
  /** Switch between auto/voice/text from the bar */
  onModeChange?: (mode: "auto" | "voice" | "text") => void;
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
  autoListen = false,
  autoListenState,
  isTTSSpeaking = false,
  isProcessing = false,
  isMuted = false,
  onToggleMute,
  onModeChange,
}: ActiveSpeakerBarProps) {
  const { settings } = useSettings();
  const [mode, setMode] = useState<BarMode>("voice");
  const [micHot, setMicHot] = useState(false);
  const [interim, setInterim] = useState("");
  const [textValue, setTextValue] = useState("");
  const [dictating, setDictating] = useState(false);
  const [supported, setSupported] = useState(true);

  // Voice features require both browser support AND user preference
  const voiceAvailable = supported && settings.voice_enabled;

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
    try {
      recognition.start();
      setMicHot(true);
    } catch {
      // InvalidStateError if recognition already started (rapid double-tap)
      setMicHot(false);
    }
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
    try {
      recognition.start();
      setDictating(true);
    } catch {
      // InvalidStateError if recognition already started
      setDictating(false);
    }
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

  // Auto mode: determine effective mode (requires voice to be available)
  const effectiveMode: BarMode = autoListen && voiceAvailable ? "auto" : mode;

  // In auto mode, notify parent about mic state from auto-listen
  useEffect(() => {
    if (effectiveMode === "auto" && autoListenState) {
      onMicStateChange?.(autoListenState.isListening);
    }
  }, [effectiveMode, autoListenState, onMicStateChange]);

  // Format time remaining
  const timeRemainingSeconds = timeRemaining ? Math.ceil(timeRemaining / 1000) : null;
  const showUrgentWarning = timeRemainingSeconds !== null && timeRemainingSeconds <= 30;

  // If voice not available (unsupported or disabled), default to text
  useEffect(() => {
    if (!voiceAvailable && mode === "voice") {
      setMode("text");
    }
  }, [voiceAvailable, mode]);

  // Auto-listen visual state determination
  const autoState = autoListenState;
  const isAutoListening = autoState?.isListening ?? false;
  const autoInterim = autoState?.interimText ?? "";
  const isSpeechActive = autoState?.isSpeechActive ?? false;
  const silenceCountdown = autoState?.silenceCountdown ?? 0;

  // Border color for auto mode
  const autoBorderClass = isAutoListening
    ? isSpeechActive
      ? "border-temp-cool mic-hot-glow"
      : silenceCountdown > 0
      ? "border-temp-warm"
      : "border-temp-cool/30"
    : isTTSSpeaking
    ? "border-accent/20"
    : "border-border";

  return (
    <div
      className={`border-t transition-all duration-300 flex-shrink-0 ${
        effectiveMode === "auto"
          ? autoBorderClass
          : isRecording
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

      {/* ─── Mode strip: all controls in one place ─── */}
      {autoListen !== undefined && (
        <div className="px-4 pt-3 pb-1 flex items-center gap-2">
          {voiceAvailable && (
            <button
              onClick={() => {
                onModeChange?.("auto");
                setMode("voice");
              }}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
                effectiveMode === "auto"
                  ? "bg-temp-cool/20 text-temp-cool border border-temp-cool/30"
                  : "text-ember-500 border border-transparent hover:text-foreground hover:bg-ember-elevated hover:border-border"
              }`}
            >
              Hands-free
            </button>
          )}
          {voiceAvailable && (
            <button
              onClick={() => {
                onModeChange?.("voice");
                setMode("voice");
              }}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
                effectiveMode === "voice"
                  ? "bg-temp-warm/20 text-temp-warm border border-temp-warm/30"
                  : "text-ember-500 border border-transparent hover:text-foreground hover:bg-ember-elevated hover:border-border"
              }`}
            >
              Tap to talk
            </button>
          )}
          <button
            onClick={() => {
              onModeChange?.("text");
              setMode("text");
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
              effectiveMode === "text"
                ? "bg-ember-elevated text-foreground border border-border"
                : "text-ember-500 border border-transparent hover:text-foreground hover:bg-ember-elevated hover:border-border"
            }`}
          >
            Type
          </button>

          {/* Speaker name — right-aligned */}
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                effectiveMode === "auto" && isSpeechActive
                  ? "bg-temp-cool"
                  : isRecording
                  ? "bg-temp-cool animate-pulse"
                  : "bg-accent/50"
              }`}
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600">
              {activeSpeakerName}
            </span>
          </div>
        </div>
      )}

      {effectiveMode === "auto" ? (
        // ─── AUTO MODE: Claude mobile-style hands-free listening ───
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Mute button / mic indicator */}
            <button
              onClick={onToggleMute}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full transition-colors"
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              <div className="relative">
                {/* Ping ring only when actively hearing speech */}
                {!isMuted && isAutoListening && isSpeechActive && (
                  <span className="absolute inset-[-8px] rounded-full border-2 border-temp-cool animate-ping opacity-25" />
                )}
                {/* Warm pulse ring during silence countdown */}
                {!isMuted && isAutoListening && !isSpeechActive && silenceCountdown > 0 && (
                  <span className="absolute inset-[-6px] rounded-full border-2 border-temp-warm animate-pulse opacity-40" />
                )}
                {/* Steady pulse ring when listening but no speech yet */}
                {!isMuted && isAutoListening && !isSpeechActive && silenceCountdown === 0 && !isTTSSpeaking && !isProcessing && (
                  <span className="absolute inset-[-6px] rounded-full border border-temp-cool/30 animate-pulse" />
                )}
                {isMuted ? (
                  <MicOffIcon
                    size={18}
                    className="text-temp-hot/70"
                  />
                ) : (
                  <MicIcon
                    size={18}
                    className={`transition-all duration-300 ${
                      isAutoListening && isSpeechActive
                        ? "text-temp-cool"
                        : isAutoListening
                        ? "text-temp-cool/50"
                        : isTTSSpeaking
                        ? "text-accent/40"
                        : "text-ember-600"
                    }`}
                  />
                )}
              </div>
            </button>

            {/* Center: state label + live transcript */}
            <div className="flex-1 min-w-0">
              {/* State label */}
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest transition-colors duration-300 ${
                    isTTSSpeaking
                      ? "text-accent/60"
                      : isProcessing
                      ? "text-ember-500 animate-pulse"
                      : isAutoListening && isSpeechActive
                      ? "text-temp-cool"
                      : isAutoListening && silenceCountdown > 0
                      ? "text-temp-warm"
                      : isAutoListening
                      ? "text-ember-600"
                      : "text-ember-700"
                  }`}
                >
                  {isMuted
                    ? "Muted — tap mic to unmute"
                    : isTTSSpeaking
                    ? "Ava is responding..."
                    : isProcessing
                    ? "Analyzing..."
                    : isAutoListening && isSpeechActive
                    ? `Listening to ${activeSpeakerName}...`
                    : isAutoListening && silenceCountdown > 0
                    ? `Sending in ${silenceCountdown}s...`
                    : isAutoListening
                    ? `${activeSpeakerName}'s turn`
                    : "Starting..."}
                </span>
              </div>

              {/* Live interim transcript */}
              {autoInterim && (
                <p className="font-mono text-sm text-foreground/80 leading-relaxed mt-1 truncate">
                  {autoInterim}
                </p>
              )}
            </div>

          </div>

          {/* Expanded transcript for longer text */}
          {autoInterim && autoInterim.length > 80 && (
            <div className="mt-2 px-1 pb-1">
              <p className="font-mono text-sm text-foreground/80 leading-relaxed">
                {autoInterim}
              </p>
            </div>
          )}
        </div>
      ) : effectiveMode === "voice" ? (
        // ─── VOICE MODE: Tap to Talk ───
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
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
              {voiceAvailable && (
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
