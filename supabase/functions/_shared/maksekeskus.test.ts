import { assertEquals } from "@std/assert";
import {
  createAuthHeader,
  verifyMac,
  buildTransactionPayload,
} from "./maksekeskus.ts";

Deno.test("createAuthHeader returns Basic auth with base64(shopId:secretKey)", () => {
  const header = createAuthHeader("my-shop-id", "my-secret-key");
  const expected = "Basic " + btoa("my-shop-id:my-secret-key");
  assertEquals(header, expected);
});

Deno.test("createAuthHeader handles special characters in credentials", () => {
  const header = createAuthHeader(
    "f7741ab2-7445-45f9-9af4-0d0408ef1e4c",
    "pfOsGD9oPaFEILwqFLHEHkPf7vZz4j3t36nAcufP1abqT9l99koyuC1IWAOcBeqt",
  );
  assertEquals(header.startsWith("Basic "), true);
  // Decode and verify
  const decoded = atob(header.replace("Basic ", ""));
  assertEquals(
    decoded,
    "f7741ab2-7445-45f9-9af4-0d0408ef1e4c:pfOsGD9oPaFEILwqFLHEHkPf7vZz4j3t36nAcufP1abqT9l99koyuC1IWAOcBeqt",
  );
});

Deno.test("verifyMac returns true for valid MAC", async () => {
  const jsonString = '{"status":"COMPLETED","transaction":"abc-123"}';
  const secretKey = "test-secret-key";
  // Compute expected MAC: UPPERCASE(HEX(SHA-512(json + secret)))
  const data = new TextEncoder().encode(jsonString + secretKey);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const expectedMac = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  const result = await verifyMac(jsonString, expectedMac, secretKey);
  assertEquals(result, true);
});

Deno.test("verifyMac returns false for invalid MAC", async () => {
  const jsonString = '{"status":"COMPLETED","transaction":"abc-123"}';
  const secretKey = "test-secret-key";
  const result = await verifyMac(jsonString, "INVALID_MAC_VALUE", secretKey);
  assertEquals(result, false);
});

Deno.test("verifyMac returns false for tampered JSON", async () => {
  const originalJson = '{"status":"COMPLETED","transaction":"abc-123"}';
  const secretKey = "test-secret-key";
  // Compute MAC for original
  const data = new TextEncoder().encode(originalJson + secretKey);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const mac = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  // Verify with tampered JSON
  const tamperedJson = '{"status":"COMPLETED","transaction":"abc-456"}';
  const result = await verifyMac(tamperedJson, mac, secretKey);
  assertEquals(result, false);
});

Deno.test("buildTransactionPayload formats amount from cents correctly", () => {
  const payload = buildTransactionPayload({
    amountCents: 849,
    currency: "EUR",
    reference: "TS-123",
    customerIp: "83.212.10.1",
    returnUrl: "https://minu.tarksober.ee/payment/success?token=abc",
    cancelUrl: "https://minu.tarksober.ee/payment/cancelled",
    notificationUrl: "https://project.supabase.co/functions/v1/payment-webhook",
  });

  assertEquals(payload.transaction.amount, "8.49");
  assertEquals(payload.transaction.currency, "EUR");
  assertEquals(payload.transaction.reference, "TS-123");
});

Deno.test("buildTransactionPayload sets customer fields", () => {
  const payload = buildTransactionPayload({
    amountCents: 490,
    currency: "EUR",
    reference: "TS-456",
    customerIp: "192.168.1.1",
    returnUrl: "https://example.com/return",
    cancelUrl: "https://example.com/cancel",
    notificationUrl: "https://example.com/notify",
    locale: "et",
    country: "ee",
  });

  assertEquals(payload.customer.ip, "192.168.1.1");
  assertEquals(payload.customer.country, "ee");
  assertEquals(payload.customer.locale, "et");
});

Deno.test("buildTransactionPayload defaults to ee/et for country/locale", () => {
  const payload = buildTransactionPayload({
    amountCents: 100,
    currency: "EUR",
    reference: "TS-789",
    customerIp: "10.0.0.1",
    returnUrl: "https://example.com/return",
    cancelUrl: "https://example.com/cancel",
    notificationUrl: "https://example.com/notify",
  });

  assertEquals(payload.customer.country, "ee");
  assertEquals(payload.customer.locale, "et");
});

Deno.test("buildTransactionPayload sets transaction URLs", () => {
  const payload = buildTransactionPayload({
    amountCents: 2490,
    currency: "EUR",
    reference: "TS-999",
    customerIp: "1.2.3.4",
    returnUrl: "https://minu.tarksober.ee/payment/success?token=xyz",
    cancelUrl: "https://minu.tarksober.ee/payment/cancelled",
    notificationUrl: "https://abc.supabase.co/functions/v1/payment-webhook",
  });

  assertEquals(
    payload.transaction_url.return_url,
    "https://minu.tarksober.ee/payment/success?token=xyz",
  );
  assertEquals(
    payload.transaction_url.cancel_url,
    "https://minu.tarksober.ee/payment/cancelled",
  );
  assertEquals(
    payload.transaction_url.notification_url,
    "https://abc.supabase.co/functions/v1/payment-webhook",
  );
});

Deno.test("buildTransactionPayload formats various cent amounts correctly", () => {
  // Whole euros
  assertEquals(
    buildTransactionPayload({
      amountCents: 1000,
      currency: "EUR",
      reference: "x",
      customerIp: "1.1.1.1",
      returnUrl: "x",
      cancelUrl: "x",
      notificationUrl: "x",
    }).transaction.amount,
    "10.00",
  );

  // Single digit cents
  assertEquals(
    buildTransactionPayload({
      amountCents: 5,
      currency: "EUR",
      reference: "x",
      customerIp: "1.1.1.1",
      returnUrl: "x",
      cancelUrl: "x",
      notificationUrl: "x",
    }).transaction.amount,
    "0.05",
  );

  // Large amount
  assertEquals(
    buildTransactionPayload({
      amountCents: 99999,
      currency: "EUR",
      reference: "x",
      customerIp: "1.1.1.1",
      returnUrl: "x",
      cancelUrl: "x",
      notificationUrl: "x",
    }).transaction.amount,
    "999.99",
  );
});
