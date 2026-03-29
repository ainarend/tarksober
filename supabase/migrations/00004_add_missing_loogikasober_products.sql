-- Add 1-month and 1-year Loogikasober products (only 3-month existed in production)
INSERT INTO products (app_slug, name, description, price_cents, currency, duration_days, max_devices, sort_order)
VALUES
  ('loogikasober', 'Loogikasõber Premium 1 kuu', 'Ligipääs kõigile mängudele 1 kuuks', 490, 'EUR', 30, 2, 2),
  ('loogikasober', 'Loogikasõber Premium 1 aasta', 'Ligipääs kõigile mängudele aastaks', 2490, 'EUR', 365, 2, 3);
