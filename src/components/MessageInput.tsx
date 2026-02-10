"use client";

import { useState } from "react";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}: MessageInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-foreground text-sm placeholder:text-factory-gray-600 focus:outline-none disabled:opacity-40"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="px-4 min-h-[44px] font-mono text-xs uppercase tracking-wider text-accent hover:text-factory-amber transition-colors disabled:opacity-40 disabled:hover:text-accent"
        >
          Send
        </button>
      </div>
    </div>
  );
}
