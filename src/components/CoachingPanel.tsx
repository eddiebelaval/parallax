"use client";

import { useState, useRef, useEffect } from "react";
import type { CoachingMessage } from "@/types/database";

interface CoachingPanelProps {
  messages: CoachingMessage[];
  loading: boolean;
  error: string | null;
  onSend: (content: string) => void;
  onClose: () => void;
}

export function CoachingPanel({
  messages,
  loading,
  error,
  onSend,
  onClose,
}: CoachingPanelProps) {
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="border-t-2 border-success bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-success">
            Private coaching -- only you can see this
          </span>
        </div>
        <button
          onClick={onClose}
          className="font-mono text-[10px] uppercase tracking-wider text-ember-600 hover:text-foreground transition-colors"
        >
          Close
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="max-h-[40vh] overflow-y-auto px-4 py-3 space-y-3"
      >
        {messages.length === 0 && (
          <p className="text-ember-600 font-mono text-xs text-center py-4">
            Ask Parallax anything privately. The other person cannot see this conversation.
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "user" ? (
              <div className="text-sm text-foreground leading-relaxed">
                <span className="font-mono text-[9px] uppercase tracking-widest text-ember-500 block mb-0.5">
                  You
                </span>
                {msg.content}
              </div>
            ) : (
              <div className="border-l-2 border-success pl-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-success block mb-0.5">
                  Parallax
                </span>
                <p className="text-sm text-success/80 italic leading-relaxed">
                  {msg.content}
                </p>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 pl-3 border-l-2 border-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="font-mono text-[10px] text-success">Thinking...</span>
          </div>
        )}
        {error && (
          <p className="font-mono text-xs text-accent">{error}</p>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ask Parallax anything..."
            disabled={loading}
            className="flex-1 bg-transparent text-foreground text-sm placeholder:text-ember-600 focus:outline-none disabled:opacity-40"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
            className="px-4 min-h-[44px] font-mono text-xs uppercase tracking-wider text-success hover:text-success/80 transition-colors disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
