import { getServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { isValidEmail } from "../_shared/validation.ts";
import { generateLicenseKey } from "../_shared/license-key.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { purchase_token, email } = await req.json();

    if (!purchase_token || !email) {
      return new Response(
        JSON.stringify({ error: "purchase_token and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = getServiceClient();

    // Fetch purchase with product info
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select(`
        id,
        mk_status,
        license_id,
        product_id,
        products (
          duration_days,
          max_devices,
          app_slug,
          name
        )
      `)
      .eq("purchase_token", purchase_token)
      .single();

    if (purchaseError || !purchase) {
      return new Response(
        JSON.stringify({ error: "Purchase not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (purchase.mk_status !== "COMPLETED") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", status: purchase.mk_status }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Idempotent: if license already created, return it
    if (purchase.license_id) {
      const { data: existingLicense } = await supabase
        .from("licenses")
        .select("license_key, app_slug, expires_at")
        .eq("id", purchase.license_id)
        .single();

      if (existingLicense) {
        return new Response(
          JSON.stringify(existingLicense),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const product = (purchase as any).products;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + product.duration_days * 24 * 60 * 60 * 1000);

    // Generate unique license key with retries
    let licenseKey: string | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateLicenseKey();
      const { data: existing } = await supabase
        .from("licenses")
        .select("id")
        .eq("license_key", candidate)
        .single();

      if (!existing) {
        licenseKey = candidate;
        break;
      }
    }

    if (!licenseKey) {
      return new Response(
        JSON.stringify({ error: "Failed to generate unique license key" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create license
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .insert({
        license_key: licenseKey,
        product_id: purchase.product_id,
        owner_email: email.toLowerCase().trim(),
        app_slug: product.app_slug,
        max_devices: product.max_devices,
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select("id, license_key, app_slug, expires_at")
      .single();

    if (licenseError || !license) {
      console.error("Failed to create license:", licenseError);
      return new Response(
        JSON.stringify({ error: "Failed to create license" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Link license to purchase and store email
    await supabase
      .from("purchases")
      .update({
        license_id: license.id,
        customer_email: email.toLowerCase().trim(),
        email_collected_at: now.toISOString(),
      })
      .eq("id", purchase.id);

    return new Response(
      JSON.stringify({
        license_key: license.license_key,
        app_slug: license.app_slug,
        expires_at: license.expires_at,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (_err) {
    console.error("collect-email error:", _err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
