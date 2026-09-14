-- Send the "new purchase" ntfy notification from Postgres instead of the
-- payment-webhook Edge Function. Edge Functions share egress IPs across many
-- Supabase customers and ntfy.sh rate-limits per IP, so the shared quota is
-- exhausted daily (HTTP 429). The database VM has its own address.
--
-- The ntfy topic is read from Vault (secret name: ntfy_topic).

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_purchase_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
  v_topic TEXT;
  v_product_name TEXT;
  v_amount TEXT;
BEGIN
  -- Only on the transition into COMPLETED
  IF NEW.mk_status IS DISTINCT FROM 'COMPLETED' OR OLD.mk_status IS NOT DISTINCT FROM 'COMPLETED' THEN
    RETURN NEW;
  END IF;

  SELECT decrypted_secret INTO v_topic
  FROM vault.decrypted_secrets
  WHERE name = 'ntfy_topic';

  IF v_topic IS NULL THEN
    RAISE WARNING 'ntfy_topic secret missing in vault, skipping purchase notification';
    RETURN NEW;
  END IF;

  SELECT name INTO v_product_name FROM public.products WHERE id = NEW.product_id;
  v_product_name := COALESCE(v_product_name, 'Tundmatu toode');

  v_amount := CASE
    WHEN NEW.mk_amount_cents IS NULL THEN ''
    ELSE REPLACE(TO_CHAR(NEW.mk_amount_cents / 100.0, 'FM9999990.00'), '.', ',') || '€'
  END;

  PERFORM net.http_post(
    url := 'https://ntfy.sh',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'topic', v_topic,
      'title', 'Uus ost: ' || v_product_name,
      'message', v_product_name || ' — ' || v_amount,
      'priority', 4,
      'tags', jsonb_build_array('moneybag')
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS purchase_completed_notify ON public.purchases;
CREATE TRIGGER purchase_completed_notify
  AFTER UPDATE OF mk_status ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_purchase_completed();
