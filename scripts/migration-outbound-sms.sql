-- Run in Supabase SQL editor if schema.sql was applied before outbound SMS fields were added.

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT FALSE;

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'aesthetic',
  ADD COLUMN IF NOT EXISTS consent_required BOOLEAN DEFAULT FALSE;

UPDATE settings
SET business_type = 'aesthetic'
WHERE business_type IS NULL;

ALTER TABLE settings
  DROP CONSTRAINT IF EXISTS settings_business_type_check;

ALTER TABLE settings
  ADD CONSTRAINT settings_business_type_check
  CHECK (business_type IN ('tradie', 'aesthetic', 'healthcare'));
