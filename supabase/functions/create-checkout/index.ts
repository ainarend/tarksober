import { getServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { isValidUuid } from "../_shared/validation.ts";
import {
  createAuthHeader,
  buildTransactionPayload,
} from "../_shared/maksekeskus.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { product_id } = await req.json();

    if (!product_id || !isValidUuid(product_id)) {
      return new Response(
        JSON.stringify({ error: "Valid product_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = getServiceClient();

    // Fetch product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, price_cents, currency, name, app_slug")
      .eq("id", product_id)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get customer IP from headers
    const customerIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "0.0.0.0";

    // Generate purchase token (64-char hex)
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const purchaseToken = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Generate reference
    const reference = `TS-${Date.now().toString(36)}`;

    // Maksekeskus config
    const mkEnv = Deno.env.get("MK_ENV") || "test";
    const mkBaseUrl = mkEnv === "live"
      ? "https://api.maksekeskus.ee"
      : "https://api.test.maksekeskus.ee";
    const mkShopId = Deno.env.get("MK_SHOP_ID") || "";
    const mkSecretKey = Deno.env.get("MK_SECRET_KEY") || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";

    // Build Maksekeskus transaction
    const payload = buildTransactionPayload({
      amountCents: product.price_cents,
      currency: product.currency,
      reference,
      customerIp,
      returnUrl: `https://minu.tarksober.ee/payment/success?token=${purchaseToken}`,
      cancelUrl: "https://minu.tarksober.ee/payment/cancelled",
      notificationUrl: `${supabaseUrl}/functions/v1/payment-webhook`,
    });

    // Call Maksekeskus API
    const mkResponse = await fetch(`${mkBaseUrl}/v1/transactions`, {
      method: "POST",
      headers: {
        "Authorization": createAuthHeader(mkShopId, mkSecretKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!mkResponse.ok) {
      const errBody = await mkResponse.text();
      console.error("Maksekeskus error:", mkResponse.status, errBody);
      return new Response(
        JSON.stringify({ error: "Failed to create payment session" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const mkData = await mkResponse.json();
    const mkTransactionId = mkData.id;

    // Store purchase in DB
    const { error: insertError } = await supabase
      .from("purchases")
      .insert({
        product_id: product.id,
        purchase_token: purchaseToken,
        mk_transaction_id: mkTransactionId,
        mk_status: "CREATED",
        mk_amount_cents: product.price_cents,
        mk_currency: product.currency,
        mk_reference: reference,
        customer_ip: customerIp,
      });

    if (insertError) {
      console.error("Failed to store purchase:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create purchase record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Return payment methods and token
    return new Response(
      JSON.stringify({
        purchase_token: purchaseToken,
        payment_methods: mkData.payment_methods,
        transaction_id: mkTransactionId,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (_err) {
    console.error("create-checkout error:", _err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
