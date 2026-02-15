import { useState, useEffect, useRef, useCallback } from "react";

interface UseTurnTimerProps {
  durationMs: number;
  onExpire: () => void;
  enabled: boolean;
}

interface UseTurnTimerReturn {
  timeRemaining: number;
  progress: number; // 0-1, where 1 is full, 0 is expired
  isExpired: boolean;
  reset: () => void;
  pause: () => void;
  resume: () => void;
}

/**
 * Turn-based timer hook with millisecond precision.
 *
 * @param durationMs - Total duration in milliseconds
 * @param onExpire - Callback when timer reaches 0
 * @param enabled - Whether timer should be running
 */
export function useTurnTimer({
  durationMs,
  onExpire,
  enabled,
}: UseTurnTimerProps): UseTurnTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(durationMs);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number>(durationMs);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  // Keep callback ref fresh
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const reset = useCallback(() => {
    setTimeRemaining(durationMs);
    startTimeRef.current = Date.now();
    expiredRef.current = false;
    setIsPaused(false);
  }, [durationMs]);

  const pause = useCallback(() => {
    // Snapshot remaining time so resume can offset correctly
    if (startTimeRef.current !== null) {
      const elapsed = Date.now() - startTimeRef.current;
      pausedRemainingRef.current = Math.max(0, durationMs - elapsed);
    }
    setIsPaused(true);
  }, [durationMs]);

  const resume = useCallback(() => {
    // Offset start time so elapsed calculation excludes paused duration
    startTimeRef.current = Date.now() - (durationMs - pausedRemainingRef.current);
    setIsPaused(false);
  }, [durationMs]);

  // Timer loop
  useEffect(() => {
    if (!enabled || isPaused) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current!;
      const remaining = Math.max(0, durationMs - elapsed);

      setTimeRemaining(remaining);

      // Fire expire callback once
      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [enabled, isPaused, durationMs]);

  // Reset when enabled changes
  useEffect(() => {
    if (enabled) {
      reset();
    }
  }, [enabled, reset]);

  const progress = timeRemaining / durationMs;
  const isExpired = timeRemaining === 0;

  return {
    timeRemaining,
    progress,
    isExpired,
    reset,
    pause,
    resume,
  };
}
