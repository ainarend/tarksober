-- Change 1-month Loogikasober price from 4.90 to 3.90
UPDATE products
SET price_cents = 390
WHERE app_slug = 'loogikasober'
  AND duration_days = 30;
