"use client";

import { useState, useCallback, useEffect } from "react";
import { MessageArea } from "./MessageArea";
import { MessageInput } from "./MessageInput";
import { VoiceInput } from "./VoiceInput";
import { NameEntry } from "./NameEntry";
import { WaitingState } from "./WaitingState";
import { SessionSummary } from "./SessionSummary";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";

type InputMode = "text" | "voice";

interface SessionViewProps {
  roomCode: string;
  onEndSession?: () => void;
}

export function SessionView({ roomCode, onEndSession }: SessionViewProps) {
  const { session, loading: sessionLoading, createSession, joinSession } = useSession(roomCode);
  const { messages, sendMessage, currentTurn } = useMessages(session?.id);

  // Track which side the local user has claimed (for same-device split-screen)
  const [localSideA, setLocalSideA] = useState<string | null>(null);
  const [localSideB, setLocalSideB] = useState<string | null>(null);

  // Input mode toggle (independent per side)
  const [inputModeA, setInputModeA] = useState<InputMode>("text");
  const [inputModeB, setInputModeB] = useState<InputMode>("text");

  // Track which message is currently being analyzed by Claude
  const [analyzingMessageId, setAnalyzingMessageId] = useState<string | null>(null);

  // Clear analyzing state when the message receives its nvc_analysis via Realtime UPDATE
  useEffect(() => {
    if (!analyzingMessageId) return;
    const msg = messages.find((m) => m.id === analyzingMessageId);
    if (msg?.nvc_analysis) {
      setAnalyzingMessageId(null);
    }
  }, [messages, analyzingMessageId]);

  // Sync local state with Realtime session updates
  useEffect(() => {
    if (session?.person_a_name && !localSideA) {
      setLocalSideA(session.person_a_name);
    }
    if (session?.person_b_name && !localSideB) {
      setLocalSideB(session.person_b_name);
    }
  }, [session?.person_a_name, session?.person_b_name, localSideA, localSideB]);

  const handleNameA = useCallback(async (name: string) => {
    if (!session) {
      const created = await createSession(name);
      if (created) setLocalSideA(name);
    } else {
      const joined = await joinSession(name, 'a');
      if (joined) setLocalSideA(name);
    }
  }, [session, createSession, joinSession]);

  const handleNameB = useCallback(async (name: string) => {
    if (!session) return;
    const joined = await joinSession(name, 'b');
    if (joined) setLocalSideB(name);
  }, [session, joinSession]);

  // Trigger NVC mediation for a message (fire-and-forget — result arrives via Realtime UPDATE)
  const triggerMediation = useCallback(async (messageId: string) => {
    if (!session?.id) return;
    setAnalyzingMessageId(messageId);
    try {
      await fetch("/api/mediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          message_id: messageId,
        }),
      });
    } catch {
      // Mediation failed — clear the loading state
      setAnalyzingMessageId(null);
    }
  }, [session?.id]);

  // End the session — status change flows through Realtime to both sides
  const endSession = useCallback(async () => {
    try {
      await fetch(`/api/sessions/${roomCode}/end`, { method: "POST" });
      onEndSession?.();
    } catch {
      // Session end failed — Realtime won't fire, no-op
    }
  }, [roomCode, onEndSession]);

  const handleSendA = useCallback(async (content: string) => {
    const sent = await sendMessage('person_a', content);
    if (sent) triggerMediation(sent.id);
  }, [sendMessage, triggerMediation]);

  const handleSendB = useCallback(async (content: string) => {
    const sent = await sendMessage('person_b', content);
    if (sent) triggerMediation(sent.id);
  }, [sendMessage, triggerMediation]);

  const bothJoined = session?.status === 'active';
  const isCompleted = session?.status === 'completed';
  const isATurn = currentTurn === 'person_a';
  const isBTurn = currentTurn === 'person_b';

  const personAName = session?.person_a_name ?? "Person A";
  const personBName = session?.person_b_name ?? "Person B";

  if (sessionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
      </div>
    );
  }

  // When session is completed, show the summary spanning the full width
  if (isCompleted) {
    return (
      <div className="flex-1 flex flex-col">
        <SessionSummary
          roomCode={roomCode}
          personAName={personAName}
          personBName={personBName}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
      {/* Person A — left side */}
      <div className="flex flex-col border-b md:border-b-0 md:border-r border-border min-h-[50vh] md:min-h-0">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-factory-gray-700">{roomCode}</span>
            <span className="font-mono text-xs uppercase tracking-wider text-factory-gray-500">
              {personAName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {bothJoined && (
              <span className={`flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider ${isATurn ? 'text-accent' : 'text-factory-gray-700'}`}>
                {isATurn && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                {isATurn ? 'Your turn' : 'Waiting'}
              </span>
            )}
            {bothJoined && (
              <button
                onClick={endSession}
                className="font-mono text-xs uppercase tracking-wider text-factory-gray-600 hover:text-foreground transition-colors"
              >
                End
              </button>
            )}
          </div>
        </div>
        {!session?.person_a_name ? (
          <NameEntry onSubmit={handleNameA} side="A" />
        ) : !bothJoined ? (
          <WaitingState roomCode={roomCode} />
        ) : (
          <>
            <MessageArea
              messages={messages}
              personAName={personAName}
              personBName={personBName}
              analyzingMessageId={analyzingMessageId}
            />
            <div className="border-t border-border">
              <div className="flex items-center">
                <button
                  onClick={() => setInputModeA(inputModeA === "text" ? "voice" : "text")}
                  disabled={!isATurn}
                  className="px-3 py-3 text-factory-gray-500 hover:text-foreground transition-colors disabled:opacity-40"
                  aria-label={inputModeA === "text" ? "Switch to voice" : "Switch to text"}
                >
                  {inputModeA === "text" ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect x="5.5" y="1" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 7.5C3 10.26 5.24 12.5 8 12.5C10.76 12.5 13 10.26 13 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="8" y1="12.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="4" y1="7" x2="6" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <line x1="8" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <line x1="5" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  {inputModeA === "text" ? (
                    <MessageInput
                      onSend={handleSendA}
                      disabled={!isATurn}
                      placeholder={isATurn ? "Type your message..." : `Waiting for ${personBName}...`}
                    />
                  ) : (
                    <VoiceInput
                      onTranscript={handleSendA}
                      disabled={!isATurn}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Person B — right side */}
      <div className="flex flex-col min-h-[50vh] md:min-h-0">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-factory-gray-700">{roomCode}</span>
            <span className="font-mono text-xs uppercase tracking-wider text-factory-gray-500">
              {personBName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {bothJoined && (
              <span className={`flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider ${isBTurn ? 'text-accent' : 'text-factory-gray-700'}`}>
                {isBTurn && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                {isBTurn ? 'Your turn' : 'Waiting'}
              </span>
            )}
            {bothJoined && (
              <button
                onClick={endSession}
                className="font-mono text-xs uppercase tracking-wider text-factory-gray-600 hover:text-foreground transition-colors"
              >
                End
              </button>
            )}
          </div>
        </div>
        {!session ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted text-sm">Waiting for Person A to create the session</p>
          </div>
        ) : !session.person_b_name ? (
          <NameEntry onSubmit={handleNameB} side="B" />
        ) : !bothJoined ? (
          <WaitingState roomCode={roomCode} />
        ) : (
          <>
            <MessageArea
              messages={messages}
              personAName={personAName}
              personBName={personBName}
              analyzingMessageId={analyzingMessageId}
            />
            <div className="border-t border-border">
              <div className="flex items-center">
                <button
                  onClick={() => setInputModeB(inputModeB === "text" ? "voice" : "text")}
                  disabled={!isBTurn}
                  className="px-3 py-3 text-factory-gray-500 hover:text-foreground transition-colors disabled:opacity-40"
                  aria-label={inputModeB === "text" ? "Switch to voice" : "Switch to text"}
                >
                  {inputModeB === "text" ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect x="5.5" y="1" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 7.5C3 10.26 5.24 12.5 8 12.5C10.76 12.5 13 10.26 13 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="8" y1="12.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="4" y1="7" x2="6" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <line x1="8" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <line x1="5" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  {inputModeB === "text" ? (
                    <MessageInput
                      onSend={handleSendB}
                      disabled={!isBTurn}
                      placeholder={isBTurn ? "Type your message..." : `Waiting for ${personAName}...`}
                    />
                  ) : (
                    <VoiceInput
                      onTranscript={handleSendB}
                      disabled={!isBTurn}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
