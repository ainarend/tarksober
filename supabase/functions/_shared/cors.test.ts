import { assertEquals, assertNotEquals } from "@std/assert";
import { corsHeaders, handleCors } from "./cors.ts";

Deno.test("corsHeaders includes Access-Control-Allow-Origin", () => {
  assertNotEquals(corsHeaders["Access-Control-Allow-Origin"], undefined);
});

Deno.test("corsHeaders includes Access-Control-Allow-Headers with required headers", () => {
  const headers = corsHeaders["Access-Control-Allow-Headers"];
  assertNotEquals(headers, undefined);
  assertEquals(headers.includes("authorization"), true);
  assertEquals(headers.includes("content-type"), true);
  assertEquals(headers.includes("apikey"), true);
});

Deno.test("corsHeaders includes Access-Control-Allow-Methods", () => {
  const methods = corsHeaders["Access-Control-Allow-Methods"];
  assertNotEquals(methods, undefined);
  assertEquals(methods.includes("GET"), true);
  assertEquals(methods.includes("POST"), true);
  assertEquals(methods.includes("OPTIONS"), true);
});

Deno.test("handleCors returns Response for OPTIONS request", () => {
  const req = new Request("https://example.com", { method: "OPTIONS" });
  const result = handleCors(req);
  assertNotEquals(result, null);
  assertEquals(result instanceof Response, true);
  assertEquals(result!.status, 200);
});

Deno.test("handleCors returns null for GET request", () => {
  const req = new Request("https://example.com", { method: "GET" });
  const result = handleCors(req);
  assertEquals(result, null);
});

Deno.test("handleCors returns null for POST request", () => {
  const req = new Request("https://example.com", { method: "POST" });
  const result = handleCors(req);
  assertEquals(result, null);
});

Deno.test("handleCors OPTIONS response includes CORS headers", () => {
  const req = new Request("https://example.com", { method: "OPTIONS" });
  const result = handleCors(req)!;
  assertEquals(
    result.headers.get("Access-Control-Allow-Origin") !== null,
    true,
  );
  assertEquals(
    result.headers.get("Access-Control-Allow-Methods") !== null,
    true,
  );
});
