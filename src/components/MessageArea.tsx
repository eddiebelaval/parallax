"use client";

import { useEffect, useRef } from "react";

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export function MessageArea({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-factory-gray-600 font-mono text-xs uppercase tracking-wider">
          No messages yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs text-accent uppercase tracking-wider">
              {msg.sender}
            </span>
            <span className="font-mono text-xs text-factory-gray-700">
              {msg.timestamp}
            </span>
          </div>
          <p className="text-foreground text-sm leading-relaxed">
            {msg.content}
          </p>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
