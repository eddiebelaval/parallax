"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidRoomCode } from "@/lib/room-code";

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        setError("Failed to create session");
        return;
      }
      const session = await res.json();
      router.push(`/session/${session.room_code}`);
    } catch {
      setError("Failed to create session");
    } finally {
      setCreating(false);
    }
  }

  function handleJoin() {
    const trimmed = joinCode.trim().toUpperCase();
    if (!isValidRoomCode(trimmed)) {
      setError("Enter a valid 6-character room code");
      return;
    }
    setError("");
    router.push(`/session/${trimmed}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-md w-full text-center">
        <p className="section-indicator justify-center mb-6">
          Conflict Resolution
        </p>
        <h1 className="text-4xl mb-4">See the other side</h1>
        <p className="text-muted text-lg leading-relaxed mb-12">
          Real-time two-person sessions that help you understand each other
          through structured, turn-based dialogue.
        </p>

        <div className="space-y-8">
          {/* Create session */}
          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full px-6 py-4 bg-accent text-factory-black font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create Session"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted font-mono text-xs uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Join session */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6));
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="ROOM CODE"
                maxLength={6}
                className="flex-1 px-4 py-4 bg-surface border border-border text-foreground font-mono text-sm tracking-widest text-center placeholder:text-factory-gray-600 focus:border-factory-gray-600 focus:outline-none transition-colors"
              />
              <button
                onClick={handleJoin}
                className="px-6 py-4 border border-border text-foreground font-mono text-sm uppercase tracking-wider hover:border-factory-gray-600 transition-colors"
              >
                Join
              </button>
            </div>
            {error && (
              <p className="text-accent font-mono text-xs">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
