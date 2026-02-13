-- Add timer_duration_ms column to sessions table
-- Allows configurable turn timer duration (defaults to 3 minutes = 180000ms)

ALTER TABLE public.sessions
ADD COLUMN timer_duration_ms INTEGER DEFAULT 180000;

COMMENT ON COLUMN public.sessions.timer_duration_ms IS 'Turn timer duration in milliseconds. Default: 180000 (3 minutes). Null = timer disabled.';
