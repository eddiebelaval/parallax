-- Intelligence Network: User Profiles + Behavioral Signals
-- Enables persistent, interview-built knowledge base per user
-- Privacy-by-design: raw profiles encrypted, signals anonymized

-- ────────────────────────────────────────────────
-- 1. User Profiles (private, encrypted, user-only)
-- ────────────────────────────────────────────────
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,

  -- Interview state
  interview_completed BOOLEAN NOT NULL DEFAULT FALSE,
  interview_phase INT NOT NULL DEFAULT 0,
  interview_started_at TIMESTAMPTZ,
  interview_completed_at TIMESTAMPTZ,

  -- Raw interview data (application-level encrypted in practice)
  raw_responses JSONB DEFAULT '[]'::jsonb,

  -- Profile metadata
  primary_context_mode TEXT DEFAULT 'intimate',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS: Users can only access their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- 2. Behavioral Signals (anonymized, consent-gated)
-- ────────────────────────────────────────────────
CREATE TABLE behavioral_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Signal classification
  signal_type TEXT NOT NULL,
  -- Types: attachment_style, conflict_mode, gottman_risk, regulation_pattern,
  --        scarf_sensitivity, drama_triangle, values, cbt_patterns, narrative_themes

  signal_value JSONB NOT NULL,
  -- Shape varies by type, e.g.:
  -- attachment_style: { primary: "anxious", secondary: "avoidant", confidence: 0.72 }
  -- conflict_mode: { primary: "avoiding", secondary: "accommodating", assertiveness: 0.3, cooperativeness: 0.7 }
  -- gottman_risk: { horsemen: ["stonewalling", "criticism"], repairCapacity: 0.6 }

  confidence FLOAT NOT NULL DEFAULT 0.5,
  source TEXT NOT NULL DEFAULT 'interview',
  -- Sources: interview, session_observation, self_update

  extracted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER behavioral_signals_updated_at
  BEFORE UPDATE ON behavioral_signals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Unique constraint: one signal per type per user
CREATE UNIQUE INDEX behavioral_signals_user_type_idx
  ON behavioral_signals(user_id, signal_type);

-- RLS: Owner always reads. Others read only with consent.
ALTER TABLE behavioral_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own signals"
  ON behavioral_signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own signals"
  ON behavioral_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own signals"
  ON behavioral_signals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own signals"
  ON behavioral_signals FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypasses RLS for cross-party signal injection
-- (checked at application level via signal_consent table)

-- ────────────────────────────────────────────────
-- 3. Signal Consent (per-session, revocable)
-- ────────────────────────────────────────────────
CREATE TYPE consent_level AS ENUM ('self_only', 'anonymous_signals');

CREATE TABLE signal_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  consent_level consent_level NOT NULL DEFAULT 'self_only',

  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,

  UNIQUE(session_id, user_id)
);

ALTER TABLE signal_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own consent"
  ON signal_consent FOR ALL
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- 4. Signal Access Log (audit trail, append-only)
-- ────────────────────────────────────────────────
CREATE TABLE signal_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who was accessed
  signal_owner_id UUID NOT NULL REFERENCES auth.users(id),

  -- What session triggered the access
  accessor_session_id UUID NOT NULL REFERENCES sessions(id),

  -- What was accessed
  signal_type TEXT NOT NULL,
  consent_level consent_level NOT NULL,

  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only: no updates or deletes
ALTER TABLE signal_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read access logs for their own signals"
  ON signal_access_log FOR SELECT
  USING (auth.uid() = signal_owner_id);

-- Insert via service role only (application-level)

-- ────────────────────────────────────────────────
-- 5. Link sessions to authenticated users (optional)
-- ────────────────────────────────────────────────
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS person_a_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS person_b_user_id UUID REFERENCES auth.users(id);
