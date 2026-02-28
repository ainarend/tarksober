import { getServiceClient } from "../_shared/supabase-client.ts";
import { verifyMac } from "../_shared/maksekeskus.ts";

Deno.serve(async (req) => {
  try {
    let jsonString: string;
    let mac: string;

    if (req.method === "GET") {
      // Maksekeskus sends GET with ?json=...&mac=...
      const url = new URL(req.url);
      jsonString = url.searchParams.get("json") || "";
      mac = url.searchParams.get("mac") || "";
    } else if (req.method === "POST") {
      const body = await req.text();
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("application/x-www-form-urlencoded")) {
        const params = new URLSearchParams(body);
        jsonString = params.get("json") || "";
        mac = params.get("mac") || "";
      } else {
        const parsed = JSON.parse(body);
        mac = parsed.mac || "";
        const { mac: _mac, ...rest } = parsed;
        jsonString = JSON.stringify(rest);
      }
    } else {
      return new Response("Method not allowed", { status: 405 });
    }

    if (!jsonString || !mac) {
      console.error("Missing json or mac params");
      return new Response("OK", { status: 200 });
    }

    // Verify MAC signature
    const secretKey = Deno.env.get("MK_SECRET_KEY") || "";
    const isValid = await verifyMac(jsonString, mac, secretKey);

    if (!isValid) {
      console.error("Invalid MAC signature");
      return new Response("OK", { status: 200 });
    }

    const data = JSON.parse(jsonString);
    const transactionId = data.transaction;
    const status = data.status;

    if (!transactionId || !status) {
      console.error("Missing transaction or status");
      return new Response("OK", { status: 200 });
    }

    const supabase = getServiceClient();

    const { data: purchase, error: fetchError } = await supabase
      .from("purchases")
      .select("id, mk_status")
      .eq("mk_transaction_id", transactionId)
      .single();

    if (fetchError || !purchase) {
      console.error("Purchase not found for transaction:", transactionId);
      return new Response("OK", { status: 200 });
    }

    if (purchase.mk_status === "COMPLETED") {
      return new Response("OK", { status: 200 });
    }

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

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("payment-webhook error:", err);
    return new Response("OK", { status: 200 });
  }
});
