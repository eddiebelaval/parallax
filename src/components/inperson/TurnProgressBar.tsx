"use client";

interface TurnProgressBarProps {
  /** Progress from 0 (expired) to 1 (full) */
  progress: number;
  /** Time remaining in milliseconds */
  timeRemaining: number;
  /** Current speaker name */
  speakerName: string;
  /** Whether the timer is actively counting */
  isActive: boolean;
}

/**
 * Horizontal progress bar that sits above the input bar.
 * Transitions green → yellow → red as time depletes.
 * Designed to be impossible to miss — right above where
 * the user's eyes focus on the input area.
 */
export function TurnProgressBar({
  progress,
  timeRemaining,
  speakerName,
  isActive,
}: TurnProgressBarProps) {
  if (!isActive) return null;

  const seconds = Math.ceil(timeRemaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Color zones: cool (>50%) → warm (25-50%) → hot (<25%)
  const barColor =
    progress > 0.5
      ? "var(--temp-cool)"
      : progress > 0.25
      ? "var(--temp-warm)"
      : "var(--temp-hot)";

  const textColorClass =
    progress > 0.5
      ? "text-temp-cool"
      : progress > 0.25
      ? "text-temp-warm"
      : "text-temp-hot";

  const isUrgent = progress <= 0.25;
  const isExpired = timeRemaining === 0;

  return (
    <div className="px-4 pt-2 pb-1 flex-shrink-0">
      {/* Time label + speaker */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`font-mono text-[10px] uppercase tracking-widest ${textColorClass} ${
            isUrgent ? "animate-pulse" : ""
          }`}
        >
          {isExpired
            ? "Time's up"
            : isUrgent
            ? `${speakerName} — wrap up`
            : `${speakerName}'s turn`}
        </span>
        <span
          className={`font-mono text-sm font-semibold tabular-nums ${textColorClass}`}
        >
          {minutes}:{remainingSeconds.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Progress bar track */}
      <div className="relative w-full h-2 rounded-full bg-ember-elevated overflow-hidden">
        {/* Filled portion */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-200 ease-linear"
          style={{
            width: `${Math.max(0, progress * 100)}%`,
            backgroundColor: barColor,
            boxShadow: isUrgent
              ? `0 0 12px ${barColor}, 0 0 4px ${barColor}`
              : `0 0 6px ${barColor}`,
          }}
        />
      </div>
    </div>
  );
}
