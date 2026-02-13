-- Solo Mode: Add 'solo' to session mode constraint
-- Solo = 1:1 conversation with Parallax (no second person needed)

-- Drop the existing constraint and recreate with solo included
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_mode_check;
ALTER TABLE sessions ADD CONSTRAINT sessions_mode_check
  CHECK (mode IN ('remote', 'in_person', 'solo'));
