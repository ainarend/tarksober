-- Create 3 manual licenses for customers who paid but didn't receive licenses
-- (payment-webhook was blocked by JWT verification, now fixed)

INSERT INTO licenses (license_key, product_id, owner_email, app_slug, max_devices, starts_at, expires_at)
SELECT
  key,
  p.id,
  'tugi@tarksober.ee',
  'loogikasober',
  2,
  NOW(),
  NOW() + INTERVAL '90 days'
FROM (
  VALUES ('W4KN-8RPH-3YME'), ('J6BT-5VXC-2GNA'), ('U9DF-4HLK-7SQR')
) AS keys(key)
CROSS JOIN products p
WHERE p.app_slug = 'loogikasober' AND p.duration_days = 90;
