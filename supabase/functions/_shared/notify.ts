export interface PurchaseNotification {
  topic: string;
  productName: string;
  amountCents: number | null | undefined;
  /** ntfy access token. Without it ntfy.sh applies a per-IP quota that Supabase's shared egress exhausts. */
  token?: string;
}

export function formatAmount(cents: number | null | undefined): string {
  if (cents == null) return "";
  return `${(cents / 100).toFixed(2).replace(".", ",")}€`;
}

/**
 * Posts a purchase notification to ntfy. Never throws; returns whether ntfy
 * accepted the message. The caller must keep the worker alive until this
 * resolves (await it, or hand it to EdgeRuntime.waitUntil).
 */
export async function sendPurchaseNotification(
  n: PurchaseNotification,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      Title: `Uus ost: ${n.productName}`,
      Priority: "high",
      Tags: "moneybag",
    };
    if (n.token) headers.Authorization = `Bearer ${n.token}`;
    const res = await fetchFn(`https://ntfy.sh/${n.topic}`, {
      method: "POST",
      headers,
      body: `${n.productName} — ${formatAmount(n.amountCents)}`,
    });
    if (!res.ok) {
      console.error("ntfy notification failed:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("ntfy notification error:", err);
    return false;
  }
}
