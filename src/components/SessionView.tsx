"use client";

import { useState, useCallback, useEffect } from "react";
import { MessageArea } from "./MessageArea";
import { MessageInput } from "./MessageInput";
import { NameEntry } from "./NameEntry";
import { WaitingState } from "./WaitingState";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";

interface SessionViewProps {
  roomCode: string;
}

export function SessionView({ roomCode }: SessionViewProps) {
  const { session, loading: sessionLoading, createSession, joinSession } = useSession(roomCode);
  const { messages, sendMessage, currentTurn } = useMessages(session?.id);

  // Track which side the local user has claimed (for same-device split-screen)
  const [localSideA, setLocalSideA] = useState<string | null>(null);
  const [localSideB, setLocalSideB] = useState<string | null>(null);

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

  const handleSendA = useCallback(async (content: string) => {
    const sent = await sendMessage('person_a', content);
    if (sent) triggerMediation(sent.id);
  }, [sendMessage, triggerMediation]);

  const handleSendB = useCallback(async (content: string) => {
    const sent = await sendMessage('person_b', content);
    if (sent) triggerMediation(sent.id);
  }, [sendMessage, triggerMediation]);

  const bothJoined = session?.status === 'active';
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

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
      {/* Person A — left side */}
      <div className="flex flex-col border-b md:border-b-0 md:border-r border-border min-h-[50vh] md:min-h-0">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-factory-gray-500">
            {personAName}
          </span>
          {bothJoined && (
            <span className={`font-mono text-xs uppercase tracking-wider ${isATurn ? 'text-accent' : 'text-factory-gray-700'}`}>
              {isATurn ? 'Your turn' : 'Waiting'}
            </span>
          )}
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
            <MessageInput
              onSend={handleSendA}
              disabled={!isATurn}
              placeholder={isATurn ? "Type your message..." : `Waiting for ${personBName}...`}
            />
          </>
        )}
      </div>

      {/* Person B — right side */}
      <div className="flex flex-col min-h-[50vh] md:min-h-0">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-factory-gray-500">
            {personBName}
          </span>
          {bothJoined && (
            <span className={`font-mono text-xs uppercase tracking-wider ${isBTurn ? 'text-accent' : 'text-factory-gray-700'}`}>
              {isBTurn ? 'Your turn' : 'Waiting'}
            </span>
          )}
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
            <MessageInput
              onSend={handleSendB}
              disabled={!isBTurn}
              placeholder={isBTurn ? "Type your message..." : `Waiting for ${personAName}...`}
            />
          </>
        )}
      </div>
    </div>
  );
}
