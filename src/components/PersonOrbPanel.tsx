"use client";

import { AudioWaveformOrb } from "./AudioWaveformOrb";
import type { Message } from "@/types/database";

interface PersonOrbPanelProps {
  name: string;
  side: "a" | "b";
  messages: Message[];
  isSpeaking?: boolean;
  isActive?: boolean;
}

/**
 * PersonOrbPanel — Visual representation of a participant in remote mode
 * Shows their orb, name, and emotional temperature over time
 */
export function PersonOrbPanel({
  name,
  side,
  messages,
  isSpeaking = false,
  isActive = false,
}: PersonOrbPanelProps) {
  const sideColor = side === "a" ? "var(--temp-warm)" : "var(--temp-hot)";
  const senderRole = side === "a" ? "person_a" : "person_b";

  // Get latest message emotional temperature for this person
  const personMessages = messages.filter((m) => m.sender === senderRole);
  const latestTemp = personMessages[personMessages.length - 1]?.emotional_temperature ?? 0.5;

  // Map temperature to intensity for visual feedback
  const intensity = latestTemp > 0.7 ? "high" : latestTemp > 0.4 ? "medium" : "low";

  return (
    <div className="flex flex-col items-center p-6 relative">
      {/* Background temperature glow */}
      <div
        className="absolute inset-0 opacity-10 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at center, ${sideColor} 0%, transparent 70%)`,
          opacity: intensity === "high" ? 0.25 : intensity === "medium" ? 0.15 : 0.08,
        }}
      />

      {/* Person orb */}
      <div className="relative z-10">
        {isActive && (
          <div
            className="absolute inset-[-12px] rounded-full border transition-all duration-300"
            style={{
              borderColor: sideColor,
              opacity: isSpeaking ? 0.6 : 0.3,
              animation: isSpeaking ? "pulse 2s ease-in-out infinite" : "none",
            }}
          />
        )}
        <AudioWaveformOrb
          name={name}
          role={side}
          waveform={null}
          energy={0.3}
          active={isSpeaking}
          size={60}
        />
      </div>

      {/* Name */}
      <span className="mt-3 font-mono text-[11px] uppercase tracking-widest text-foreground">
        {name}
      </span>

      {/* Status indicator */}
      {isActive && (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: sideColor }}
          />
          <span className="font-mono text-[9px] uppercase tracking-widest text-ember-500">
            {isSpeaking ? "Speaking" : "Your turn"}
          </span>
        </div>
      )}

      {/* Temperature indicator bars */}
      {personMessages.length > 0 && (
        <div className="mt-4 w-full max-w-[80px]">
          <div className="flex gap-0.5 h-8">
            {personMessages.slice(-8).map((msg, i) => {
              const temp = msg.emotional_temperature ?? 0.5;
              const color =
                temp > 0.7
                  ? "var(--temp-hot)"
                  : temp > 0.4
                  ? "var(--temp-warm)"
                  : "var(--temp-cool)";
              const height = `${Math.max(20, temp * 100)}%`;
              const isLatest = i === personMessages.slice(-8).length - 1;

              return (
                <div
                  key={msg.id}
                  className="flex-1 flex items-end transition-all duration-500"
                >
                  <div
                    className="w-full rounded-t-sm transition-all duration-500"
                    style={{
                      height,
                      backgroundColor: color,
                      boxShadow: isLatest ? `0 0 8px ${color}` : "none",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <span className="mt-1 block text-center font-mono text-[8px] uppercase tracking-widest text-ember-600">
            Emotional arc
          </span>
        </div>
      )}
    </div>
  );
}
