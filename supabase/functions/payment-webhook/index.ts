import { getServiceClient } from "../_shared/supabase-client.ts";
import { verifyMac } from "../_shared/maksekeskus.ts";

Deno.serve(async (req) => {
  // No CORS needed — server-to-server from Maksekeskus
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.text();

    // Maksekeskus sends URL-encoded form data with `json` and `mac` fields,
    // or sometimes raw JSON. Handle both.
    let jsonString: string;
    let mac: string;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(body);
      jsonString = params.get("json") || "";
      mac = params.get("mac") || "";
    } else {
      // Try parsing as JSON with mac field
      const parsed = JSON.parse(body);
      mac = parsed.mac || "";
      // Reconstruct JSON string without mac for verification
      const { mac: _mac, ...rest } = parsed;
      jsonString = JSON.stringify(rest);
    }

    if (!jsonString || !mac) {
      return new Response("Bad request", { status: 400 });
    }

    // Verify MAC signature
    const secretKey = Deno.env.get("MK_SECRET_KEY") || "";
    const isValid = await verifyMac(jsonString, mac, secretKey);

    if (!isValid) {
      console.error("Invalid MAC signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const data = JSON.parse(jsonString);
    const transactionId = data.transaction;
    const status = data.status;

    if (!transactionId || !status) {
      return new Response("Bad request: missing transaction or status", { status: 400 });
    }

    const supabase = getServiceClient();

    // Idempotency: check current status
    const { data: purchase, error: fetchError } = await supabase
      .from("purchases")
      .select("id, mk_status")
      .eq("mk_transaction_id", transactionId)
      .single();

    if (fetchError || !purchase) {
      console.error("Purchase not found for transaction:", transactionId);
      // Return 200 anyway — Maksekeskus expects 2xx
      return new Response("OK", { status: 200 });
    }

    // If already completed, skip (idempotent)
    if (purchase.mk_status === "COMPLETED") {
      return new Response("OK", { status: 200 });
    }

    // Update status
    const updateFields: Record<string, unknown> = {
      mk_status: status,
    };

    if (status === "COMPLETED") {
      updateFields.paid_at = new Date().toISOString();
    }

    await supabase
      .from("purchases")
      .update(updateFields)
      .eq("id", purchase.id);

    // Return 200 immediately as required by Maksekeskus (< 30 seconds)
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("payment-webhook error:", err);
    // Still return 200 to avoid retries for malformed requests
    return new Response("OK", { status: 200 });
  }
});
