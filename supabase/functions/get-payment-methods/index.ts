import { getServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAuthHeader } from "../_shared/maksekeskus.ts";

const CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = getServiceClient();

    // Check cache
    const { data: cached } = await supabase
      .from("payment_methods_cache")
      .select("methods, fetched_at")
      .eq("id", "singleton")
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.fetched_at).getTime();
      if (age < CACHE_MAX_AGE_MS) {
        return new Response(JSON.stringify(cached.methods), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch fresh from Maksekeskus
    const mkEnv = Deno.env.get("MK_ENV") || "test";
    const mkBaseUrl = mkEnv === "live"
      ? "https://api.maksekeskus.ee"
      : "https://api.test.maksekeskus.ee";
    const mkShopId = Deno.env.get("MK_SHOP_ID") || "";
    const mkSecretKey = Deno.env.get("MK_SECRET_KEY") || "";

    const response = await fetch(
      `${mkBaseUrl}/v1/methods?country=ee&currency=EUR`,
      {
        headers: {
          "Authorization": createAuthHeader(mkShopId, mkSecretKey),
        },
      },
    );

    if (!response.ok) {
      // Return stale cache if available
      if (cached) {
        return new Response(JSON.stringify(cached.methods), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ error: "Failed to fetch payment methods" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const methods = await response.json();

    // Update cache
    await supabase
      .from("payment_methods_cache")
      .upsert({
        id: "singleton",
        methods,
        fetched_at: new Date().toISOString(),
      });

    return new Response(JSON.stringify(methods), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_err) {
    console.error("get-payment-methods error:", _err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
