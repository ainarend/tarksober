import { getServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { isValidUuid } from "../_shared/validation.ts";
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

    const { activation_id } = await req.json();

    if (!activation_id || !isValidUuid(activation_id)) {
      return new Response(
        JSON.stringify({ error: "Valid activation_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const serviceClient = getServiceClient();

    // Verify the activation belongs to a license owned by this user
    const { data: activation, error: fetchError } = await serviceClient
      .from("device_activations")
      .select(`
        id,
        is_active,
        licenses!inner (
          user_id
        )
      `)
      .eq("id", activation_id)
      .eq("licenses.user_id", user.id)
      .single();

    if (fetchError || !activation) {
      return new Response(
        JSON.stringify({ error: "Activation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!activation.is_active) {
      return new Response(
        JSON.stringify({ ok: true, message: "Already deactivated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Deactivate
    const { error: updateError } = await serviceClient
      .from("device_activations")
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
      })
      .eq("id", activation_id);

    if (updateError) {
      console.error("deactivate-device error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to deactivate device" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (_err) {
    console.error("deactivate-device error:", _err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
