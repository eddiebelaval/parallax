-- Persist interview conversation mid-phase so users can leave and resume.
-- Without this, conversation history only lives in React state and is lost on navigation.
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS interview_messages JSONB DEFAULT '[]'::jsonb;
