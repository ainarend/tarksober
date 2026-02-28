-- TarkSober Self-Service Platform: Initial Schema
-- Tables: products, purchases, licenses, device_activations, payment_methods_cache

-- 1. Products catalog
CREATE TABLE products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_slug      text NOT NULL,
  name          text NOT NULL,
  description   text,
  price_cents   integer NOT NULL CHECK (price_cents > 0),
  currency      text NOT NULL DEFAULT 'EUR',
  duration_days integer NOT NULL CHECK (duration_days > 0),
  max_devices   integer NOT NULL DEFAULT 2 CHECK (max_devices > 0),
  is_active     boolean NOT NULL DEFAULT true,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_app_active ON products (app_slug, is_active, sort_order);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  USING (true);

-- 2. Licenses (created after payment + email collection)
CREATE TABLE licenses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key   text NOT NULL UNIQUE,
  product_id    uuid NOT NULL REFERENCES products(id),
  owner_email   text NOT NULL,
  user_id       uuid REFERENCES auth.users(id),
  app_slug      text NOT NULL,
  max_devices   integer NOT NULL DEFAULT 2,
  starts_at     timestamptz NOT NULL,
  expires_at    timestamptz NOT NULL,
  is_revoked    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_licenses_key ON licenses (license_key);
CREATE INDEX idx_licenses_email ON licenses (owner_email);
CREATE INDEX idx_licenses_user ON licenses (user_id);
CREATE INDEX idx_licenses_app_expires ON licenses (app_slug, expires_at);

ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own licenses"
  ON licenses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Purchases (tracks payment flow)
CREATE TABLE purchases (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          uuid NOT NULL REFERENCES products(id),
  purchase_token      text NOT NULL UNIQUE,
  mk_transaction_id   text UNIQUE,
  mk_status           text NOT NULL DEFAULT 'CREATED',
  mk_amount_cents     integer NOT NULL,
  mk_currency         text NOT NULL DEFAULT 'EUR',
  mk_reference        text,
  customer_email      text,
  customer_ip         inet NOT NULL,
  license_id          uuid REFERENCES licenses(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  paid_at             timestamptz,
  email_collected_at  timestamptz,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchases_token ON purchases (purchase_token);
CREATE INDEX idx_purchases_mk_txn ON purchases (mk_transaction_id);
CREATE INDEX idx_purchases_email ON purchases (customer_email);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
-- No public policies: all access via service_role in Edge Functions

-- 4. Device activations
CREATE TABLE device_activations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id      uuid NOT NULL REFERENCES licenses(id),
  device_id       text NOT NULL,
  activated_at    timestamptz NOT NULL DEFAULT now(),
  is_active       boolean NOT NULL DEFAULT true,
  deactivated_at  timestamptz,
  UNIQUE (license_id, device_id)
);

CREATE INDEX idx_device_activations_license ON device_activations (license_id, is_active);
CREATE INDEX idx_device_activations_device ON device_activations (device_id);

ALTER TABLE device_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own device activations"
  ON device_activations FOR SELECT
  TO authenticated
  USING (
    license_id IN (
      SELECT id FROM licenses WHERE user_id = auth.uid()
    )
  );

-- 5. Payment methods cache (single-row)
CREATE TABLE payment_methods_cache (
  id          text PRIMARY KEY DEFAULT 'singleton',
  methods     jsonb NOT NULL,
  fetched_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payment_methods_cache ENABLE ROW LEVEL SECURITY;
-- No public policies

-- 6. License key generation function
CREATE OR REPLACE FUNCTION generate_license_key()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  charset text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  charset_len integer := length(charset);
  result text := '';
  seg integer;
  i integer;
BEGIN
  FOR seg IN 1..3 LOOP
    IF seg > 1 THEN
      result := result || '-';
    END IF;
    FOR i IN 1..4 LOOP
      result := result || substr(charset, floor(random() * charset_len + 1)::integer, 1);
    END LOOP;
  END LOOP;
  RETURN result;
END;
$$;

-- 7. Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER licenses_updated_at BEFORE UPDATE ON licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
