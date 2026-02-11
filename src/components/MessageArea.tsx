"use client";

import { useEffect, useRef } from "react";
import { MessageCard } from "./MessageCard";
import { SignalRail } from "./SignalRail";
import type { Message, ContextMode } from "@/types/database";

interface MessageAreaProps {
  messages: Message[];
  personAName: string;
  personBName: string;
  analyzingMessageId?: string | null;
  lensCount?: number;
}

export function MessageArea({
  messages,
  personAName,
  personBName,
  analyzingMessageId,
  lensCount,
}: MessageAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-ember-600 font-mono text-xs uppercase tracking-wider">
          No messages yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex gap-3">
        <SignalRail messages={messages} />
        <div className="flex-1 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              <MessageCard
                sender={msg.sender}
                senderName={
                  msg.sender === "person_a"
                    ? personAName
                    : msg.sender === "person_b"
                      ? personBName
                      : "Claude"
                }
                content={msg.content}
                timestamp={new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                nvcAnalysis={msg.nvc_analysis}
              />
              {analyzingMessageId === msg.id && !msg.nvc_analysis && (
                <div className="pl-4 mt-2 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ember-600">
                    Analyzing{lensCount ? ` through ${lensCount} lenses` : ''}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
