import { assertEquals } from "@std/assert";
import { formatAmount, sendPurchaseNotification } from "./notify.ts";

Deno.test("formatAmount renders cents as Estonian euro string", () => {
  assertEquals(formatAmount(1990), "19,90€");
  assertEquals(formatAmount(500), "5,00€");
  assertEquals(formatAmount(null), "");
  assertEquals(formatAmount(undefined), "");
});

Deno.test("sendPurchaseNotification posts to ntfy topic with title and body", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchStub = (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return Promise.resolve(new Response("ok", { status: 200 }));
  };

  const ok = await sendPurchaseNotification(
    { topic: "my-topic", productName: "Loogikasõber", amountCents: 1990 },
    fetchStub as typeof fetch,
  );

  assertEquals(ok, true);
  assertEquals(calls.length, 1);
  assertEquals(calls[0].url, "https://ntfy.sh/my-topic");
  assertEquals(calls[0].init.method, "POST");
  const headers = calls[0].init.headers as Record<string, string>;
  assertEquals(headers.Title, "Uus ost: Loogikasõber");
  assertEquals(headers.Priority, "high");
  assertEquals(calls[0].init.body, "Loogikasõber — 19,90€");
});

Deno.test("sendPurchaseNotification sends bearer token when provided and omits it otherwise", async () => {
  const seen: Record<string, string>[] = [];
  const fetchStub = (_url: string | URL | Request, init?: RequestInit) => {
    seen.push((init?.headers as Record<string, string>) ?? {});
    return Promise.resolve(new Response("ok", { status: 200 }));
  };

  await sendPurchaseNotification(
    { topic: "t", productName: "X", amountCents: 100, token: "tk_abc" },
    fetchStub as typeof fetch,
  );
  await sendPurchaseNotification(
    { topic: "t", productName: "X", amountCents: 100 },
    fetchStub as typeof fetch,
  );

  assertEquals(seen[0].Authorization, "Bearer tk_abc");
  assertEquals("Authorization" in seen[1], false);
});

Deno.test("sendPurchaseNotification returns false on non-2xx without throwing", async () => {
  const fetchStub = () => Promise.resolve(new Response("nope", { status: 500 }));
  const ok = await sendPurchaseNotification(
    { topic: "t", productName: "X", amountCents: 100 },
    fetchStub as typeof fetch,
  );
  assertEquals(ok, false);
});

Deno.test("sendPurchaseNotification returns false on network error without throwing", async () => {
  const fetchStub = () => Promise.reject(new Error("boom"));
  const ok = await sendPurchaseNotification(
    { topic: "t", productName: "X", amountCents: 100 },
    fetchStub as typeof fetch,
  );
  assertEquals(ok, false);
});
