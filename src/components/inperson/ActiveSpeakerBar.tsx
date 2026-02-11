"use client";

import { useState } from "react";
import { MessageInput } from "@/components/MessageInput";
import { VoiceInput } from "@/components/VoiceInput";
import { MicIcon, KeyboardIcon } from "@/components/icons";

type InputMode = "text" | "voice";

interface ActiveSpeakerBarProps {
  activeSpeakerName: string;
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ActiveSpeakerBar({
  activeSpeakerName,
  onSend,
  disabled = false,
}: ActiveSpeakerBarProps) {
  const [inputMode, setInputMode] = useState<InputMode>("text");

  return (
    <div className="border-t border-border">
      <div className="flex items-center">
        <button
          onClick={() => setInputMode(inputMode === "text" ? "voice" : "text")}
          disabled={disabled}
          className="flex items-center justify-center min-w-[44px] min-h-[44px] text-ember-500 hover:text-foreground transition-colors disabled:opacity-40"
          aria-label={inputMode === "text" ? "Switch to voice" : "Switch to text"}
        >
          {inputMode === "text" ? <MicIcon size={14} /> : <KeyboardIcon size={14} />}
        </button>
        <div className="flex-1">
          {inputMode === "text" ? (
            <MessageInput
              onSend={onSend}
              disabled={disabled}
              placeholder={`${activeSpeakerName}, speak your truth...`}
            />
          ) : (
            <VoiceInput
              onTranscript={onSend}
              disabled={disabled}
            />
          )}
        </div>
        <div className="px-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600">
            {activeSpeakerName}
          </span>
        </div>
      </div>
    </div>
  );
}
