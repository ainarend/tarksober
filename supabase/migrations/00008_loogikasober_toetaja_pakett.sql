-- Loogikasõber is free for everyone. The one paid product becomes a supporter
-- pack: "Toetaja pakett", 5 € for 3 months, which unlocks the bonus kratid and
-- memory-picture drawing in the app. The 1-month and 1-year variants are hidden.
UPDATE products
SET name = 'Toetaja pakett',
    description = 'Toeta Loogikasõbra arendamist: lisakratid ja mälestuspildid 3 kuuks',
    price_cents = 500,
    original_price_cents = NULL,
    sale_ends_at = NULL,
    sort_order = 1,
    updated_at = now()
WHERE app_slug = 'loogikasober'
  AND duration_days = 90;

UPDATE products
SET is_active = false,
    updated_at = now()
WHERE app_slug = 'loogikasober'
  AND duration_days IN (30, 365);
