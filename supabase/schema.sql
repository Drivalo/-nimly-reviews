-- Jobs table (business owner adds customers here and marks complete)
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  job_description TEXT,
  job_value NUMERIC,
  status TEXT DEFAULT 'pending',
  -- pending | complete | sms_sent | rated | reviewed | complaint
  completed_at TIMESTAMPTZ,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  rating_received_at TIMESTAMPTZ,
  feedback TEXT,
  review_requested_at TIMESTAMPTZ,
  sequence_halted BOOLEAN DEFAULT FALSE,
  consent_given BOOLEAN DEFAULT FALSE,
  inngest_event_id TEXT
);

-- SMS log
CREATE TABLE sms_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  body TEXT NOT NULL,
  twilio_message_sid TEXT,
  from_number TEXT,
  to_number TEXT
);

-- Settings (single row)
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT DEFAULT 'Lumière Spa',
  owner_name TEXT DEFAULT 'James',
  owner_phone TEXT,
  google_review_link TEXT,
  rating_sms_template TEXT DEFAULT '',
  delay_minutes INTEGER DEFAULT 90,
  business_type TEXT DEFAULT 'aesthetic' CHECK (business_type IN ('tradie', 'aesthetic', 'healthcare', 'hair_salon', 'dentist', 'estate_agent')),
  consent_required BOOLEAN DEFAULT FALSE
);

-- Insert default settings row
INSERT INTO settings (business_name, owner_name) VALUES ('Lumière Spa', 'James');

-- Indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_customer_phone ON jobs(customer_phone);
CREATE INDEX idx_sms_log_job_id ON sms_log(job_id);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Service role bypass (all access via service role key in API routes)
CREATE POLICY "Service role full access" ON jobs FOR ALL USING (true);
CREATE POLICY "Service role full access" ON sms_log FOR ALL USING (true);
CREATE POLICY "Service role full access" ON settings FOR ALL USING (true);
