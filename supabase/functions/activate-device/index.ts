import { getServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { isValidLicenseKey } from "../_shared/license-key.ts";
import { maskEmail } from "../_shared/validation.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { license_key, device_id, app_slug } = await req.json();

    if (!license_key || !device_id || !app_slug) {
      return new Response(
        JSON.stringify({ error: "license_key, device_id, and app_slug are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!isValidLicenseKey(license_key)) {
      return new Response(
        JSON.stringify({ status: "invalid" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = getServiceClient();
    const now = new Date().toISOString();

    // Look up the license
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("id, owner_email, max_devices, expires_at, is_revoked, app_slug")
      .eq("license_key", license_key)
      .eq("app_slug", app_slug)
      .single();

    if (licenseError || !license) {
      return new Response(
        JSON.stringify({ status: "invalid" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (license.is_revoked || new Date(license.expires_at) <= new Date()) {
      return new Response(
        JSON.stringify({ status: "invalid" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check if this device is already activated for this license
    const { data: existing } = await supabase
      .from("device_activations")
      .select("id, is_active")
      .eq("license_id", license.id)
      .eq("device_id", device_id)
      .single();

    if (existing?.is_active) {
      // Already active — idempotent success
      return new Response(
        JSON.stringify({ status: "active", expires_at: license.expires_at }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Count active devices for this license
    const { count } = await supabase
      .from("device_activations")
      .select("id", { count: "exact", head: true })
      .eq("license_id", license.id)
      .eq("is_active", true);

    if ((count ?? 0) >= license.max_devices) {
      return new Response(
        JSON.stringify({
          status: "device_limit_reached",
          owner_email_hint: maskEmail(license.owner_email),
          manage_url: "https://minu.tarksober.ee",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Activate: upsert (handles case where device was previously deactivated)
    if (existing && !existing.is_active) {
      await supabase
        .from("device_activations")
        .update({ is_active: true, activated_at: now, deactivated_at: null })
        .eq("id", existing.id);
    } else {
      const { error: insertError } = await supabase
        .from("device_activations")
        .insert({
          license_id: license.id,
          device_id,
          activated_at: now,
        });

      if (insertError) {
        // Unique constraint violation — race condition, treat as success
        if (insertError.code === "23505") {
          return new Response(
            JSON.stringify({ status: "active", expires_at: license.expires_at }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ status: "active", expires_at: license.expires_at }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
