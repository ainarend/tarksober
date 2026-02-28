import { getServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get user from JWT
    const authHeader = req.headers.get("authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const serviceClient = getServiceClient();

    // Fetch licenses with product info and device counts
    const { data: licenses, error } = await serviceClient
      .from("licenses")
      .select(`
        id,
        license_key,
        app_slug,
        max_devices,
        starts_at,
        expires_at,
        is_revoked,
        created_at,
        products (
          name,
          description,
          duration_days
        ),
        device_activations (
          id,
          device_id,
          activated_at,
          is_active
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("my-licenses error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch licenses" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Transform: include active device count
    const result = (licenses || []).map((lic: any) => ({
      id: lic.id,
      license_key: lic.license_key,
      app_slug: lic.app_slug,
      max_devices: lic.max_devices,
      starts_at: lic.starts_at,
      expires_at: lic.expires_at,
      is_revoked: lic.is_revoked,
      is_expired: new Date(lic.expires_at) <= new Date(),
      product: lic.products,
      active_device_count: (lic.device_activations || []).filter(
        (d: any) => d.is_active,
      ).length,
      devices: (lic.device_activations || []).filter((d: any) => d.is_active),
    }));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_err) {
    console.error("my-licenses error:", _err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
