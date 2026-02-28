import { getServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const appSlug = url.searchParams.get("app_slug");

    if (!appSlug) {
      return new Response(
        JSON.stringify({ error: "app_slug parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, app_slug, name, description, price_cents, currency, duration_days, max_devices, sort_order")
      .eq("app_slug", appSlug)
      .eq("is_active", true)
      .order("sort_order")
      .order("price_cents");

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch products" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
