-- Set 3-month Loogikasober product to sale price: 4.99€ (was 8.49€)
UPDATE products
SET price_cents = 499,
    original_price_cents = 849
WHERE app_slug = 'loogikasober'
  AND duration_days = 90;
