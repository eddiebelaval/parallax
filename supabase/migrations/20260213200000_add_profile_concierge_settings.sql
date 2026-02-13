-- Profile Concierge Settings Migration
-- Adds all profile settings columns needed for voice-driven account management

-- Display settings
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pronouns TEXT;

-- Notification preferences
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true;

-- Session preferences
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS default_session_mode TEXT DEFAULT 'in-person';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS auto_record_sessions BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS enable_live_transcription BOOLEAN DEFAULT false;

-- Privacy settings
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS share_behavioral_signals BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS allow_research_data_use BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT false;

-- Voice preferences
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS voice_speed FLOAT DEFAULT 1.0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS voice_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_voice_id TEXT;

-- Interview settings
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS allow_reinterview BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_interview_date TIMESTAMP;

-- Accessibility settings
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS high_contrast_mode BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS reduce_motion BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS screen_reader_mode BOOLEAN DEFAULT false;

-- Advanced features
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS experimental_features BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS beta_access BOOLEAN DEFAULT false;

-- Add constraints
ALTER TABLE user_profiles ADD CONSTRAINT voice_speed_range CHECK (voice_speed >= 0.5 AND voice_speed <= 2.0);
ALTER TABLE user_profiles ADD CONSTRAINT valid_session_mode CHECK (default_session_mode IN ('in-person', 'remote'));

-- Create index for public profiles (for discovery feature)
CREATE INDEX IF NOT EXISTS idx_user_profiles_public ON user_profiles(public_profile) WHERE public_profile = true;

-- Add comment
COMMENT ON TABLE user_profiles IS 'User profiles with voice-driven concierge settings for complete account management';
