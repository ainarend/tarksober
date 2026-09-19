-- Toetaja pakett runs 6 months instead of 3, same 5 € price.
UPDATE products
SET duration_days = 180,
    description = 'Toeta Loogikasõbra arendamist: lisakratid ja mälestuspildid 6 kuuks',
    updated_at = now()
WHERE app_slug = 'loogikasober'
  AND name = 'Toetaja pakett';
