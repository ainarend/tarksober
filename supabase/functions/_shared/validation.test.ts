import { assertEquals } from "@std/assert";
import { isValidEmail, isValidUuid, maskEmail } from "./validation.ts";

// --- isValidEmail ---

Deno.test("isValidEmail accepts standard emails", () => {
  assertEquals(isValidEmail("user@example.com"), true);
  assertEquals(isValidEmail("first.last@domain.ee"), true);
  assertEquals(isValidEmail("user+tag@gmail.com"), true);
  assertEquals(isValidEmail("a@b.co"), true);
});

Deno.test("isValidEmail rejects invalid emails", () => {
  assertEquals(isValidEmail(""), false);
  assertEquals(isValidEmail("not-an-email"), false);
  assertEquals(isValidEmail("@domain.com"), false);
  assertEquals(isValidEmail("user@"), false);
  assertEquals(isValidEmail("user@.com"), false);
  assertEquals(isValidEmail("user @domain.com"), false);
  assertEquals(isValidEmail("user@domain"), false);
});

// --- isValidUuid ---

Deno.test("isValidUuid accepts valid v4 UUIDs", () => {
  assertEquals(
    isValidUuid("f7741ab2-7445-45f9-9af4-0d0408ef1e4c"),
    true,
  );
  assertEquals(
    isValidUuid("550e8400-e29b-41d4-a716-446655440000"),
    true,
  );
});

Deno.test("isValidUuid rejects invalid UUIDs", () => {
  assertEquals(isValidUuid(""), false);
  assertEquals(isValidUuid("not-a-uuid"), false);
  assertEquals(isValidUuid("f7741ab2-7445-45f9-9af4"), false); // too short
  assertEquals(isValidUuid("f7741ab2-7445-45f9-9af4-0d0408ef1e4c-extra"), false);
  assertEquals(isValidUuid("f7741ab2744545f99af40d0408ef1e4c"), false); // no dashes
});

// --- maskEmail ---

Deno.test("maskEmail masks the local part correctly", () => {
  // First char + *** + last char before @ + domain
  assertEquals(maskEmail("kasutaja@gmail.com"), "k***a@gmail.com");
  assertEquals(maskEmail("john.doe@example.ee"), "j***e@example.ee");
});

Deno.test("maskEmail handles short local parts", () => {
  // 2-char local part: show first + *** + last
  assertEquals(maskEmail("ab@domain.com"), "a***b@domain.com");
  // 1-char local part: just show it + ***
  assertEquals(maskEmail("a@domain.com"), "a***@domain.com");
});

Deno.test("maskEmail preserves full domain", () => {
  const masked = maskEmail("user@long-domain.example.co.uk");
  assertEquals(masked.endsWith("@long-domain.example.co.uk"), true);
});
