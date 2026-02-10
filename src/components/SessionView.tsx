"use client";

import { useState, useCallback, useEffect } from "react";
import { MessageArea } from "./MessageArea";
import { MessageInput } from "./MessageInput";
import { NameEntry } from "./NameEntry";
import { WaitingState } from "./WaitingState";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import type { MessageSender } from "@/types/database";

interface SessionViewProps {
  roomCode: string;
}

export function SessionView({ roomCode }: SessionViewProps) {
  const { session, loading: sessionLoading, createSession, joinSession } = useSession(roomCode);
  const { messages, sendMessage, currentTurn } = useMessages(session?.id);

  // Track which side the local user has claimed (for same-device split-screen)
  const [localSideA, setLocalSideA] = useState<string | null>(null);
  const [localSideB, setLocalSideB] = useState<string | null>(null);

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
      // Session doesn't exist yet — create it with person A
      const created = await createSession(name);
      if (created) setLocalSideA(name);
    } else {
      // Session exists — join as person A
      const joined = await joinSession(name, 'a');
      if (joined) setLocalSideA(name);
    }
  }, [session, createSession, joinSession]);

  const handleNameB = useCallback(async (name: string) => {
    if (!session) return;
    const joined = await joinSession(name, 'b');
    if (joined) setLocalSideB(name);
  }, [session, joinSession]);

  const handleSendA = useCallback(async (content: string) => {
    await sendMessage('person_a', content);
  }, [sendMessage]);

  const handleSendB = useCallback(async (content: string) => {
    await sendMessage('person_b', content);
  }, [sendMessage]);

  const bothJoined = session?.status === 'active';
  const isATurn = currentTurn === 'person_a';
  const isBTurn = currentTurn === 'person_b';

  // Format messages for the MessageArea component
  const formattedMessages = messages.map((msg) => ({
    id: msg.id,
    sender: msg.sender === 'person_a'
      ? (session?.person_a_name ?? 'Person A')
      : msg.sender === 'person_b'
        ? (session?.person_b_name ?? 'Person B')
        : 'Mediator',
    content: msg.content,
    timestamp: new Date(msg.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

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
            {session?.person_a_name ?? "Person A"}
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
            <MessageArea messages={formattedMessages} />
            <MessageInput
              onSend={handleSendA}
              disabled={!isATurn}
              placeholder={isATurn ? "Type your message..." : `Waiting for ${session?.person_b_name ?? "Person B"}...`}
            />
          </>
        )}
      </div>

      {/* Person B — right side */}
      <div className="flex flex-col min-h-[50vh] md:min-h-0">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-factory-gray-500">
            {session?.person_b_name ?? "Person B"}
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
            <MessageArea messages={formattedMessages} />
            <MessageInput
              onSend={handleSendB}
              disabled={!isBTurn}
              placeholder={isBTurn ? "Type your message..." : `Waiting for ${session?.person_a_name ?? "Person A"}...`}
            />
          </>
        )}
      </div>
    </div>
  );
}
