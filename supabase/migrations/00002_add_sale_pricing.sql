-- Add sale pricing fields to products
ALTER TABLE products
  ADD COLUMN original_price_cents integer CHECK (original_price_cents IS NULL OR original_price_cents > 0),
  ADD COLUMN sale_ends_at timestamptz;

COMMENT ON COLUMN products.original_price_cents IS 'Original price before sale (NULL = no sale)';
COMMENT ON COLUMN products.sale_ends_at IS 'When the sale ends (NULL = indefinite sale)';
