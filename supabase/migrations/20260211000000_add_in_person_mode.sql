-- In-Person Mode: session mode, onboarding state, and issues table

-- Sessions: add mode column
ALTER TABLE sessions ADD COLUMN mode text NOT NULL DEFAULT 'remote'
  CHECK (mode IN ('remote', 'in_person'));

-- Sessions: add onboarding step tracking
ALTER TABLE sessions ADD COLUMN onboarding_step text
  CHECK (onboarding_step IS NULL OR onboarding_step IN (
    'introductions', 'set_stage', 'set_goals', 'complete'));

-- Sessions: add onboarding context (names, stage description, goals)
ALTER TABLE sessions ADD COLUMN onboarding_context jsonb;

-- Issues table: discrete conflict points extracted by Claude
CREATE TABLE issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  raised_by text NOT NULL CHECK (raised_by IN ('person_a', 'person_b')),
  source_message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'unaddressed'
    CHECK (status IN ('unaddressed', 'well_addressed', 'poorly_addressed')),
  addressed_by_message_id uuid REFERENCES messages(id),
  grading_rationale text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for issues
CREATE INDEX idx_issues_session_id ON issues(session_id);
CREATE INDEX idx_issues_source_message ON issues(source_message_id);
CREATE INDEX idx_issues_status ON issues(session_id, status);

-- Auto-update updated_at on issues
CREATE TRIGGER issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Realtime for issues
ALTER PUBLICATION supabase_realtime ADD TABLE issues;

-- RLS policies (permissive for hackathon)
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert issues"
  ON issues FOR INSERT
  WITH CHECK (EXISTS(SELECT 1 FROM sessions WHERE id = session_id));

CREATE POLICY "Anyone can read issues"
  ON issues FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update issues"
  ON issues FOR UPDATE
  USING (true);
