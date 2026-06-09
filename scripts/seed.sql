-- Lumière Spa demo seed
-- Run this in the Supabase SQL editor after schema.sql has been applied.
-- Clears existing jobs/SMS data and inserts 8 demo appointments + 11 SMS log entries.

-- ── Clear existing data (keeps settings row) ──────────────────────────────────
DELETE FROM sms_log;
DELETE FROM jobs;

-- ── Jobs (8 appointments in various states) ─────────────────────────────────
INSERT INTO jobs (
  id,
  created_at,
  customer_name,
  customer_phone,
  customer_email,
  job_description,
  job_value,
  status,
  completed_at,
  rating,
  rating_received_at,
  feedback,
  review_requested_at,
  sequence_halted
) VALUES
  -- 2 pending
  (
    'a1000001-0001-4001-8001-000000000001',
    NOW(),
    'Sofia Laurent',
    '+61412345001',
    'sofia.laurent@email.com',
    'Deep tissue massage — 60 min, focus on shoulders and lower back',
    145,
    'pending',
    NULL, NULL, NULL, NULL, NULL, FALSE
  ),
  (
    'a1000001-0001-4001-8001-000000000002',
    NOW() - INTERVAL '1 day',
    'Priya Sharma',
    '+61412345002',
    'priya.sharma@email.com',
    'Facial treatment — hydrating renewal with enzyme peel',
    120,
    'pending',
    NULL, NULL, NULL, NULL, NULL, FALSE
  ),
  -- 2 complete (waiting for SMS delay)
  (
    'a1000001-0001-4001-8001-000000000003',
    NOW() - INTERVAL '2 days',
    'Emma Wilson',
    '+61412345003',
    'emma.w@email.com',
    'Couples package — side-by-side massage with champagne',
    380,
    'complete',
    NOW() - INTERVAL '2 hours',
    NULL, NULL, NULL, NULL, FALSE
  ),
  (
    'a1000001-0001-4001-8001-000000000004',
    NOW() - INTERVAL '2 days',
    'Marcus Webb',
    '+61412345004',
    NULL,
    'Hot stone massage — 90 min full body relaxation',
    165,
    'complete',
    NOW() - INTERVAL '1 hour',
    NULL, NULL, NULL, NULL, FALSE
  ),
  -- 1 sms_sent
  (
    'a1000001-0001-4001-8001-000000000005',
    NOW() - INTERVAL '3 days',
    'Lisa Nguyen',
    '+61412345005',
    'lisa.n@email.com',
    'LED light therapy — anti-aging facial series, session 3 of 6',
    95,
    'sms_sent',
    NOW() - INTERVAL '1 day',
    NULL, NULL, NULL,
    NOW() - INTERVAL '3 hours',
    FALSE
  ),
  -- 2 reviewed (5 stars)
  (
    'a1000001-0001-4001-8001-000000000006',
    NOW() - INTERVAL '5 days',
    'Charlotte Davies',
    '+61412345006',
    'charlotte.davies@email.com',
    'Waxing appointment — full leg and bikini line',
    85,
    'reviewed',
    NOW() - INTERVAL '4 days',
    5,
    NOW() - INTERVAL '3 days',
    NULL,
    NOW() - INTERVAL '4 days',
    TRUE
  ),
  (
    'a1000001-0001-4001-8001-000000000007',
    NOW() - INTERVAL '7 days',
    'Rachel Torres',
    '+61412345007',
    'rachel.t@email.com',
    'Aromatherapy relaxation massage — lavender and eucalyptus blend',
    130,
    'reviewed',
    NOW() - INTERVAL '6 days',
    5,
    NOW() - INTERVAL '5 days',
    NULL,
    NOW() - INTERVAL '6 days',
    TRUE
  ),
  -- 1 complaint (2 stars, feedback filled)
  (
    'a1000001-0001-4001-8001-000000000008',
    NOW() - INTERVAL '4 days',
    'Olivia Hart',
    '+61412345008',
    'olivia.hart@email.com',
    'Microdermabrasion facial — brightening treatment',
    175,
    'complaint',
    NOW() - INTERVAL '3 days',
    2,
    NOW() - INTERVAL '2 days',
    'My appointment started 25 minutes late and the treatment room wasn''t ready. The facial felt rushed and my skin was red and irritated for hours afterward.',
    NOW() - INTERVAL '3 days',
    TRUE
  );

-- ── SMS log (11 entries for progressed appointments) ────────────────────────
INSERT INTO sms_log (job_id, direction, body, from_number, to_number, created_at) VALUES
  -- Lisa Nguyen — sms_sent
  (
    'a1000001-0001-4001-8001-000000000005',
    'outbound',
    'Hi Lisa, it''s James from Lumière Spa. We just finished your job — hope everything looks great! Quick question: how would you rate our service today? Reply with a number: 1⭐ 2⭐ 3⭐ 4⭐ 5⭐',
    '+15551234567',
    '+61412345005',
    NOW() - INTERVAL '3 hours'
  ),
  -- Charlotte Davies — reviewed
  (
    'a1000001-0001-4001-8001-000000000006',
    'outbound',
    'Hi Charlotte, it''s James from Lumière Spa. We just finished your job — hope everything looks great! Quick question: how would you rate our service today? Reply with a number: 1⭐ 2⭐ 3⭐ 4⭐ 5⭐',
    '+15551234567',
    '+61412345006',
    NOW() - INTERVAL '4 days'
  ),
  (
    'a1000001-0001-4001-8001-000000000006',
    'inbound',
    '5',
    '+61412345006',
    '+15551234567',
    NOW() - INTERVAL '3 days'
  ),
  (
    'a1000001-0001-4001-8001-000000000006',
    'outbound',
    'Thank you so much! 🙏 We really appreciate it. If you have a moment, it would mean the world to us if you could share that on Google — it only takes 30 seconds: https://g.page/r/lumiere-spa — James & the Lumière Spa team',
    '+15551234567',
    '+61412345006',
    NOW() - INTERVAL '3 days'
  ),
  -- Rachel Torres — reviewed
  (
    'a1000001-0001-4001-8001-000000000007',
    'outbound',
    'Hi Rachel, it''s James from Lumière Spa. We just finished your job — hope everything looks great! Quick question: how would you rate our service today? Reply with a number: 1⭐ 2⭐ 3⭐ 4⭐ 5⭐',
    '+15551234567',
    '+61412345007',
    NOW() - INTERVAL '6 days'
  ),
  (
    'a1000001-0001-4001-8001-000000000007',
    'inbound',
    '5⭐',
    '+61412345007',
    '+15551234567',
    NOW() - INTERVAL '5 days'
  ),
  (
    'a1000001-0001-4001-8001-000000000007',
    'outbound',
    'Thank you so much! 🙏 We really appreciate it. If you have a moment, it would mean the world to us if you could share that on Google — it only takes 30 seconds: https://g.page/r/lumiere-spa — James & the Lumière Spa team',
    '+15551234567',
    '+61412345007',
    NOW() - INTERVAL '5 days'
  ),
  -- Olivia Hart — complaint
  (
    'a1000001-0001-4001-8001-000000000008',
    'outbound',
    'Hi Olivia, it''s James from Lumière Spa. We just finished your job — hope everything looks great! Quick question: how would you rate our service today? Reply with a number: 1⭐ 2⭐ 3⭐ 4⭐ 5⭐',
    '+15551234567',
    '+61412345008',
    NOW() - INTERVAL '3 days'
  ),
  (
    'a1000001-0001-4001-8001-000000000008',
    'inbound',
    '2',
    '+61412345008',
    '+15551234567',
    NOW() - INTERVAL '2 days'
  ),
  (
    'a1000001-0001-4001-8001-000000000008',
    'outbound',
    'Thank you for letting us know — we''re really sorry to hear that. We want to make this right. Could you tell us what happened? http://localhost:3000/feedback/a1000001-0001-4001-8001-000000000008',
    '+15551234567',
    '+61412345008',
    NOW() - INTERVAL '2 days'
  ),
  (
    'a1000001-0001-4001-8001-000000000008',
    'outbound',
    '🚨 URGENT — Olivia Hart (+61412345008) rated you 2/5. Call them now to resolve before it goes public.',
    '+15551234567',
    '+61412345009',
    NOW() - INTERVAL '2 days'
  );

-- ── Update settings ───────────────────────────────────────────────────────────
UPDATE settings SET
  business_name = 'Lumière Spa',
  owner_name = 'James',
  owner_phone = '+61412345009',
  google_review_link = 'https://g.page/r/lumiere-spa-review',
  delay_minutes = 90
WHERE id = (SELECT id FROM settings LIMIT 1);
