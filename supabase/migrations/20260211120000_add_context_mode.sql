-- V3: Conflict Intelligence Engine — add context_mode to sessions
-- Allows sessions to specify which conflict context lenses to activate.
-- Default 'intimate' preserves V1 behavior (NVC + Gottman + CBT + Drama Triangle + Attachment).

ALTER TABLE sessions
  ADD COLUMN context_mode text NOT NULL DEFAULT 'intimate';

ALTER TABLE sessions
  ADD CONSTRAINT sessions_context_mode_check
  CHECK (context_mode IN (
    'intimate',
    'family',
    'professional_peer',
    'professional_hierarchical',
    'transactional',
    'civil_structural'
  ));
