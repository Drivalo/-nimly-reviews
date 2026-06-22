-- Run in Supabase SQL editor to add per-business API keys.

CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE
);

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_businesses_api_key ON businesses(api_key);
CREATE INDEX IF NOT EXISTS idx_jobs_business_id ON jobs(business_id);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON businesses;
CREATE POLICY "Service role full access" ON businesses FOR ALL USING (true);

-- Example: create a business and store its API key in Zapier
-- INSERT INTO businesses (name, api_key)
-- VALUES ('Lumière Spa', 'your-long-random-api-key-here');
