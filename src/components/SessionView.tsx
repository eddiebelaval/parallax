"use client";

import { useState, useCallback } from "react";
import { MessageArea, type Message } from "./MessageArea";
import { MessageInput } from "./MessageInput";
import { NameEntry } from "./NameEntry";
import { WaitingState } from "./WaitingState";

interface PersonState {
  name: string | null;
  messages: Message[];
}

interface SessionViewProps {
  roomCode: string;
}

export function SessionView({ roomCode }: SessionViewProps) {
  const [personA, setPersonA] = useState<PersonState>({
    name: null,
    messages: [],
  });
  const [personB, setPersonB] = useState<PersonState>({
    name: null,
    messages: [],
  });

  const handleNameA = useCallback((name: string) => {
    setPersonA((prev) => ({ ...prev, name }));
  }, []);

  const handleNameB = useCallback((name: string) => {
    setPersonB((prev) => ({ ...prev, name }));
  }, []);

  const handleSendA = useCallback(
    (content: string) => {
      if (!personA.name) return;
      const msg: Message = {
        id: crypto.randomUUID(),
        sender: personA.name,
        content,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setPersonA((prev) => ({
        ...prev,
        messages: [...prev.messages, msg],
      }));
    },
    [personA.name]
  );

  const handleSendB = useCallback(
    (content: string) => {
      if (!personB.name) return;
      const msg: Message = {
        id: crypto.randomUUID(),
        sender: personB.name,
        content,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setPersonB((prev) => ({
        ...prev,
        messages: [...prev.messages, msg],
      }));
    },
    [personB.name]
  );

  const bothJoined = personA.name !== null && personB.name !== null;

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
      {/* Person A — left side */}
      <div className="flex flex-col border-b md:border-b-0 md:border-r border-border min-h-[50vh] md:min-h-0">
        <div className="px-4 py-2 border-b border-border">
          <span className="font-mono text-xs uppercase tracking-wider text-factory-gray-500">
            {personA.name ?? "Person A"}
          </span>
        </div>
        {personA.name === null ? (
          <NameEntry onSubmit={handleNameA} side="A" />
        ) : !bothJoined ? (
          <WaitingState roomCode={roomCode} />
        ) : (
          <>
            <MessageArea messages={personA.messages} />
            <MessageInput onSend={handleSendA} />
          </>
        )}
      </div>

      {/* Person B — right side */}
      <div className="flex flex-col min-h-[50vh] md:min-h-0">
        <div className="px-4 py-2 border-b border-border">
          <span className="font-mono text-xs uppercase tracking-wider text-factory-gray-500">
            {personB.name ?? "Person B"}
          </span>
        </div>
        {personB.name === null ? (
          <NameEntry onSubmit={handleNameB} side="B" />
        ) : !bothJoined ? (
          <WaitingState roomCode={roomCode} />
        ) : (
          <>
            <MessageArea messages={personB.messages} />
            <MessageInput onSend={handleSendB} />
          </>
        )}
      </div>
    </div>
  );
}
