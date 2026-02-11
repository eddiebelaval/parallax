"use client";

import { useState } from "react";

interface NameEntryProps {
  onSubmit: (name: string) => void;
  side: "A" | "B";
}

export function NameEntry({ onSubmit, side }: NameEntryProps) {
  const [name, setName] = useState("");

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      <p className="section-indicator mb-6">Person {side}</p>
      <p className="text-muted text-sm mb-6">Enter your name to begin</p>
      <div className="flex gap-3 w-full max-w-xs">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Your name"
          maxLength={30}
          className="flex-1 px-4 py-3 bg-surface border border-border text-foreground text-sm placeholder:text-ember-600 focus:border-ember-600 focus:outline-none transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="px-4 py-3 bg-accent text-ember-black font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Join
        </button>
      </div>
    </div>
  );
}
