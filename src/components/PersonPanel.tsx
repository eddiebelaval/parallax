"use client";

import { ReactNode } from "react";
import { MessageArea } from "./MessageArea";
import { MessageInput } from "./MessageInput";
import { VoiceInput } from "./VoiceInput";
import { MicIcon, KeyboardIcon } from "./icons";
import type { Message } from "@/types/database";

type InputMode = "text" | "voice";

interface PersonPanelProps {
  side: "A" | "B";
  name: string;
  otherName: string;
  isMyTurn: boolean;
  onSend: (content: string) => void;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  roomCode: string;
  bothJoined: boolean;
  onEndSession: () => void;
  messages: Message[];
  personAName: string;
  personBName: string;
  analyzingMessageId: string | null;
  mediationError: string | null;
  /** Rendered when the session isn't active yet (name entry, waiting state, etc.) */
  preJoinContent: ReactNode;
  className?: string;
}

export function PersonPanel({
  name,
  otherName,
  isMyTurn,
  onSend,
  inputMode,
  onInputModeChange,
  roomCode,
  bothJoined,
  onEndSession,
  messages,
  personAName,
  personBName,
  analyzingMessageId,
  mediationError,
  preJoinContent,
  className,
}: PersonPanelProps) {
  return (
    <div className={`flex flex-col min-h-[50vh] md:min-h-0 ${className ?? ""}`}>
      {/* Panel header */}
      <div className="px-3 md:px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="font-mono text-[10px] text-ember-700">{roomCode}</span>
          <span className="font-mono text-xs uppercase tracking-wider text-ember-500">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {bothJoined && (
            <span className={`flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider ${isMyTurn ? 'text-accent' : 'text-ember-700'}`}>
              {isMyTurn && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
              {isMyTurn ? 'Your turn' : 'Waiting'}
            </span>
          )}
          {bothJoined && (
            <button
              onClick={onEndSession}
              className="font-mono text-xs uppercase tracking-wider text-ember-600 hover:text-foreground transition-colors"
            >
              End
            </button>
          )}
        </div>
      </div>

      {/* Pre-join content (name entry / waiting) or active session */}
      {!bothJoined ? (
        preJoinContent
      ) : (
        <>
          <MessageArea
            messages={messages}
            personAName={personAName}
            personBName={personBName}
            analyzingMessageId={analyzingMessageId}
          />
          {mediationError && (
            <div className="px-4 py-1.5 border-t border-border">
              <p className="font-mono text-xs text-accent">{mediationError}</p>
            </div>
          )}
          <div className="border-t border-border">
            <div className="flex items-center">
              <button
                onClick={() => onInputModeChange(inputMode === "text" ? "voice" : "text")}
                disabled={!isMyTurn}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] text-ember-500 hover:text-foreground transition-colors disabled:opacity-40"
                aria-label={inputMode === "text" ? "Switch to voice" : "Switch to text"}
              >
                {inputMode === "text" ? <MicIcon size={14} /> : <KeyboardIcon size={14} />}
              </button>
              <div className="flex-1">
                {inputMode === "text" ? (
                  <MessageInput
                    onSend={onSend}
                    disabled={!isMyTurn}
                    placeholder={isMyTurn ? "Type your message..." : `Waiting for ${otherName}...`}
                  />
                ) : (
                  <VoiceInput
                    onTranscript={onSend}
                    disabled={!isMyTurn}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
