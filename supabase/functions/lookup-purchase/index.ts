import { getServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const transactionId = url.searchParams.get("transaction_id");

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: "transaction_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = getServiceClient();

    const { data: purchase, error } = await supabase
      .from("purchases")
      .select("purchase_token")
      .eq("mk_transaction_id", transactionId)
      .single();

    if (error || !purchase) {
      return new Response(
        JSON.stringify({ error: "Purchase not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ purchase_token: purchase.purchase_token }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
