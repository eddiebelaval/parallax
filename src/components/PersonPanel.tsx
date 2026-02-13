"use client";

import { ReactNode } from "react";
import { MessageArea } from "./MessageArea";
import { ActiveSpeakerBar } from "./inperson/ActiveSpeakerBar";
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
  endingSession?: boolean;
  messages: Message[];
  personAName: string;
  personBName: string;
  analyzingMessageId: string | null;
  mediationError: string | null;
  preJoinContent: ReactNode;
  className?: string;
  lensCount?: number;
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
  endingSession = false,
  messages,
  personAName,
  personBName,
  analyzingMessageId,
  mediationError,
  preJoinContent,
  className,
  lensCount,
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
              disabled={endingSession}
              className="font-mono text-xs uppercase tracking-wider text-ember-600 hover:text-foreground transition-colors disabled:opacity-40"
            >
              {endingSession ? "Ending..." : "End"}
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
            lensCount={lensCount}
          />
          {mediationError && (
            <div className="px-4 py-1.5 border-t border-border">
              <p className="font-mono text-xs text-accent-secondary">{mediationError}</p>
            </div>
          )}
          <ActiveSpeakerBar
            activeSpeakerName={name}
            onSend={onSend}
            disabled={!isMyTurn}
            autoListen={false}
          />
        </>
      )}
    </div>
  );
}
