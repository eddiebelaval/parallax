"use client";

import { useEffect, useRef } from "react";
import { playTimerChime } from "@/lib/timerAudio";

interface TurnTimerProps {
  /** Time remaining in milliseconds */
  timeRemaining: number;
  /** Progress from 0 (expired) to 1 (full) */
  progress: number;
  /** Speaker's name */
  speakerName: string;
  /** Whether timer is active */
  isActive: boolean;
}

/**
 * Circular turn timer with visual countdown.
 * Shows time remaining and pulses as it approaches expiration.
 */
export function TurnTimer({
  timeRemaining,
  progress,
  speakerName,
  isActive,
}: TurnTimerProps) {
  const hasPlayedChimeRef = useRef(false);
  const announcementRef = useRef<string>("");

  // Play audio cue when time expires
  useEffect(() => {
    if (timeRemaining === 0 && isActive && !hasPlayedChimeRef.current) {
      playTimerChime();
      hasPlayedChimeRef.current = true;
    }
    // Reset when timer resets
    if (timeRemaining > 0) {
      hasPlayedChimeRef.current = false;
    }
  }, [timeRemaining, isActive]);

  // Screen reader announcements at key milestones
  useEffect(() => {
    const seconds = Math.ceil(timeRemaining / 1000);

    if (seconds === 60 && isActive) {
      announcementRef.current = "1 minute remaining";
    } else if (seconds === 30 && isActive) {
      announcementRef.current = "30 seconds remaining, please wrap up";
    } else if (seconds === 0 && isActive) {
      announcementRef.current = `Time's up, switching to next speaker`;
    } else {
      announcementRef.current = "";
    }
  }, [timeRemaining, isActive, speakerName]);

  const seconds = Math.ceil(timeRemaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Determine urgency color
  const getColor = () => {
    if (progress > 0.5) return "text-temp-cool"; // Cool (calm)
    if (progress > 0.25) return "text-temp-warm"; // Warm (caution)
    return "text-temp-hot"; // Hot (urgent)
  };

  const getStrokeColor = () => {
    if (progress > 0.5) return "#6aab8e"; // Cool
    if (progress > 0.25) return "#d4a040"; // Warm
    return "#c45c3c"; // Hot
  };

  const getGlowClass = () => {
    if (progress <= 0.25) return "animate-pulse";
    return "";
  };

  // SVG circle parameters
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <>
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcementRef.current}
      </div>

      <div className="flex items-center gap-3">
        {/* Circular timer */}
        <div className="relative w-20 h-20">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-ember-border"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={getStrokeColor()}
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${getGlowClass()}`}
              style={{
                filter: progress <= 0.25 ? "drop-shadow(0 0 8px currentColor)" : undefined,
              }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono text-lg font-semibold ${getColor()}`}>
              {minutes}:{remainingSeconds.toString().padStart(2, "0")}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-ember-muted">
              {progress <= 0.1 ? "wrap up" : "left"}
            </span>
          </div>
        </div>

        {/* Speaker info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-accent animate-pulse" : "bg-ember-border"}`} />
            <span className="font-mono text-xs uppercase tracking-widest text-ember-heading">
              {speakerName}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ember-muted">
            {isActive ? "Speaking now" : "Waiting"}
          </span>
        </div>
      </div>
    </>
  );
}
