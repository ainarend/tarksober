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

    if (authError || !user?.email) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const serviceClient = getServiceClient();

    // Link all licenses with matching email to this user
    const { data, error } = await serviceClient
      .from("licenses")
      .update({ user_id: user.id })
      .eq("owner_email", user.email.toLowerCase())
      .is("user_id", null)
      .select("id");

    if (error) {
      console.error("link-account error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to link licenses" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ linked_count: data?.length || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (_err) {
    console.error("link-account error:", _err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
