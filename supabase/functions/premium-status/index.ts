import { getServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const deviceId = url.searchParams.get("device_id");
    const appSlug = url.searchParams.get("app_slug");

    if (!deviceId || !appSlug) {
      return new Response(
        JSON.stringify({ error: "device_id and app_slug parameters are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = getServiceClient();
    const now = new Date().toISOString();

    // Find an active device activation linked to a valid, non-expired license for this app
    const { data, error } = await supabase
      .from("device_activations")
      .select(`
        activated_at,
        licenses!inner (
          expires_at,
          is_revoked,
          app_slug
        )
      `)
      .eq("device_id", deviceId)
      .eq("is_active", true)
      .eq("licenses.app_slug", appSlug)
      .eq("licenses.is_revoked", false)
      .gt("licenses.expires_at", now)
      .limit(1);

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to check premium status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (data && data.length > 0) {
      const license = (data[0] as any).licenses;
      return new Response(
        JSON.stringify({ is_premium: true, expires_at: license.expires_at }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ is_premium: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
