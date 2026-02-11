"use client";

import { useCallback } from "react";
import { MessageArea } from "@/components/MessageArea";
import { XRayScoreboard } from "./XRayScoreboard";
import { ActiveSpeakerBar } from "./ActiveSpeakerBar";
import { useIssues } from "@/hooks/useIssues";
import type { Session, Message, MessageSender } from "@/types/database";

interface XRayViewProps {
  session: Session;
  roomCode: string;
  messages: Message[];
  sendMessage: (sender: MessageSender, content: string) => Promise<Message | null>;
  currentTurn: MessageSender;
  triggerMediation: (messageId: string) => void;
  endSession: () => void;
  analyzingMessageId: string | null;
  mediationError: string | null;
  setMediationError: (error: string | null) => void;
}

export function XRayView({
  session,
  roomCode,
  messages,
  sendMessage,
  currentTurn,
  triggerMediation,
  endSession,
  analyzingMessageId,
  mediationError,
  setMediationError,
}: XRayViewProps) {
  const { personAIssues, personBIssues } = useIssues(session.id);

  const personAName = session.person_a_name ?? "Person A";
  const personBName = session.person_b_name ?? "Person B";
  const activeSpeaker = currentTurn === "person_a" ? personAName : personBName;

  const handleSend = useCallback(async (content: string) => {
    setMediationError(null);
    const sent = await sendMessage(currentTurn, content);
    if (sent) {
      // Fire NVC mediation and issue analysis in parallel
      triggerMediation(sent.id);
      fetch("/api/issues/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          message_id: sent.id,
        }),
      }).catch(() => {
        // Issue analysis failure is non-blocking
      });
    }
  }, [sendMessage, currentTurn, triggerMediation, session.id, setMediationError]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-ember-700">{roomCode}</span>
          <span className="font-mono text-xs uppercase tracking-wider text-ember-500">
            {personAName} & {personBName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {activeSpeaker}&apos;s turn
          </span>
          <button
            onClick={endSession}
            className="font-mono text-xs uppercase tracking-wider text-ember-600 hover:text-foreground transition-colors"
          >
            End
          </button>
        </div>
      </div>

      {/* Main content: messages + scoreboard */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Message stream */}
        <div className="flex-1 flex flex-col min-h-0 order-2 md:order-1">
          <MessageArea
            messages={messages}
            personAName={personAName}
            personBName={personBName}
            analyzingMessageId={analyzingMessageId}
          />
        </div>

        {/* X-Ray Scoreboard */}
        <div className="md:w-80 border-b md:border-b-0 md:border-l border-border flex flex-col order-1 md:order-2 max-h-48 md:max-h-none">
          <XRayScoreboard
            personAIssues={personAIssues}
            personBIssues={personBIssues}
            personAName={personAName}
            personBName={personBName}
          />
        </div>
      </div>

      {/* Mediation error */}
      {mediationError && (
        <div className="px-4 py-1.5 border-t border-border">
          <p className="font-mono text-xs text-accent">{mediationError}</p>
        </div>
      )}

      {/* Input bar */}
      <ActiveSpeakerBar
        activeSpeakerName={activeSpeaker}
        onSend={handleSend}
      />
    </div>
  );
}
