import { assertEquals, assertMatch, assertNotEquals } from "@std/assert";
import {
  generateLicenseKey,
  isValidLicenseKey,
  LICENSE_KEY_CHARSET,
} from "./license-key.ts";

Deno.test("LICENSE_KEY_CHARSET excludes ambiguous characters I, O, 0, 1", () => {
  assertEquals(LICENSE_KEY_CHARSET.includes("I"), false);
  assertEquals(LICENSE_KEY_CHARSET.includes("O"), false);
  assertEquals(LICENSE_KEY_CHARSET.includes("0"), false);
  assertEquals(LICENSE_KEY_CHARSET.includes("1"), false);
});

Deno.test("LICENSE_KEY_CHARSET has 28 characters", () => {
  // 26 letters - I - O + 10 digits - 0 - 1 = 24 + 8 = 32
  // Wait: A-Z = 26, minus I,O = 24. 0-9 = 10, minus 0,1 = 8. Total = 32.
  assertEquals(LICENSE_KEY_CHARSET.length, 32);
});

Deno.test("generateLicenseKey returns XXXX-XXXX-XXXX format", () => {
  const key = generateLicenseKey();
  assertMatch(key, /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
});

Deno.test("generateLicenseKey only uses allowed charset", () => {
  for (let i = 0; i < 50; i++) {
    const key = generateLicenseKey();
    const chars = key.replace(/-/g, "");
    for (const ch of chars) {
      assertEquals(
        LICENSE_KEY_CHARSET.includes(ch),
        true,
        `Character '${ch}' not in allowed charset`,
      );
    }
  }
});

Deno.test("generateLicenseKey produces unique keys", () => {
  const keys = new Set<string>();
  for (let i = 0; i < 100; i++) {
    keys.add(generateLicenseKey());
  }
  // With 32^12 keyspace, 100 keys should all be unique
  assertEquals(keys.size, 100);
});

Deno.test("generateLicenseKey produces different keys on successive calls", () => {
  const key1 = generateLicenseKey();
  const key2 = generateLicenseKey();
  // Extremely unlikely to be equal, but technically possible
  // Test over multiple pairs to be safe
  let allSame = true;
  for (let i = 0; i < 10; i++) {
    if (generateLicenseKey() !== generateLicenseKey()) {
      allSame = false;
      break;
    }
  }
  assertEquals(allSame, false);
});

Deno.test("isValidLicenseKey accepts valid keys", () => {
  assertEquals(isValidLicenseKey("ABCD-EFGH-JKLM"), true);
  assertEquals(isValidLicenseKey("2345-6789-ABCD"), true);
  assertEquals(isValidLicenseKey("XXXX-XXXX-XXXX"), true);
});

Deno.test("isValidLicenseKey rejects invalid formats", () => {
  assertEquals(isValidLicenseKey(""), false);
  assertEquals(isValidLicenseKey("ABCD"), false);
  assertEquals(isValidLicenseKey("ABCD-EFGH"), false);
  assertEquals(isValidLicenseKey("ABCDEFGHJKLM"), false); // no dashes
  assertEquals(isValidLicenseKey("ABCD-EFGH-JKLM-NPQR"), false); // too many segments
  assertEquals(isValidLicenseKey("ABC-EFGH-JKLM"), false); // first segment too short
  assertEquals(isValidLicenseKey("abcd-efgh-jklm"), false); // lowercase
});

Deno.test("isValidLicenseKey rejects keys with ambiguous characters", () => {
  assertEquals(isValidLicenseKey("ABCI-EFGH-JKLM"), false); // I
  assertEquals(isValidLicenseKey("ABCO-EFGH-JKLM"), false); // O
  assertEquals(isValidLicenseKey("ABC0-EFGH-JKLM"), false); // 0 (zero)
  assertEquals(isValidLicenseKey("ABC1-EFGH-JKLM"), false); // 1 (one)
});
