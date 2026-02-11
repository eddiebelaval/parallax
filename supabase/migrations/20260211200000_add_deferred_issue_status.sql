-- Add 'deferred' to issue status CHECK constraint
-- Allows users to pocket issues for later discussion

ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_status_check;

ALTER TABLE issues ADD CONSTRAINT issues_status_check
  CHECK (status IN ('unaddressed', 'well_addressed', 'poorly_addressed', 'deferred'));
