-- Add persistent solo memory to user profiles
-- Stores accumulated insights across solo sessions as JSONB
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS solo_memory JSONB DEFAULT '{}'::jsonb;
