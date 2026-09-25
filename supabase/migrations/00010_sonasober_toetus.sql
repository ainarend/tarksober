-- Sõnasõber is free and has no in-app purchase. Its site offers "Toeta meid": a one-off
-- 5 € donation through Maksekeskus. A donation hands out no license, so it skips the
-- email step and has no duration or device limit.
ALTER TABLE products
  ADD COLUMN kind text NOT NULL DEFAULT 'license'
  CHECK (kind IN ('license', 'donation'));

ALTER TABLE products DROP CONSTRAINT products_duration_days_check;
ALTER TABLE products ADD CONSTRAINT products_duration_days_check
  CHECK ((kind = 'license' AND duration_days > 0) OR (kind = 'donation' AND duration_days = 0));

-- Fixed id: sonasober.tarksober.ee links straight to minu.tarksober.ee/checkout/<id>.
INSERT INTO products (id, app_slug, name, description, price_cents, duration_days, max_devices, kind, sort_order)
VALUES (
  'da3bf4bb-e2b6-43e0-97d5-03cdf8306e58',
  'sonasober',
  'Toetus',
  'Ühekordne toetus Sõnasõbra arendamiseks',
  500,
  0,
  1,
  'donation',
  1
);
