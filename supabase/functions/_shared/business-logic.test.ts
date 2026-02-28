import { assertEquals } from "@std/assert";
import {
  validateActivationInput,
  checkLicenseValidity,
  determineActivationResult,
  validateEmailCollectionInput,
  canCollectEmail,
  calculateExpiresAt,
  isPremiumActive,
  type License,
  type Purchase,
} from "./business-logic.ts";

// --- Helpers ---

function makeLicense(overrides: Partial<License> = {}): License {
  return {
    id: "lic-1",
    license_key: "ABCD-EFGH-JKLM",
    product_id: "prod-1",
    owner_email: "kasutaja@gmail.com",
    user_id: null,
    app_slug: "loogikasober",
    max_devices: 2,
    starts_at: "2026-01-01T00:00:00Z",
    expires_at: "2026-12-31T23:59:59Z",
    is_revoked: false,
    ...overrides,
  };
}

function makePurchase(overrides: Partial<Purchase> = {}): Purchase {
  return {
    id: "pur-1",
    product_id: "prod-1",
    purchase_token: "abc123",
    mk_transaction_id: "txn-1",
    mk_status: "COMPLETED",
    mk_amount_cents: 849,
    customer_email: null,
    license_id: null,
    ...overrides,
  };
}

// --- validateActivationInput ---

Deno.test("validateActivationInput returns null for valid input", () => {
  assertEquals(
    validateActivationInput("ABCD-EFGH-JKLM", "device-1", "loogikasober"),
    null,
  );
});

Deno.test("validateActivationInput rejects missing fields", () => {
  assertEquals(
    validateActivationInput("", "device-1", "loogikasober") !== null,
    true,
  );
  assertEquals(
    validateActivationInput("ABCD-EFGH-JKLM", "", "loogikasober") !== null,
    true,
  );
  assertEquals(
    validateActivationInput("ABCD-EFGH-JKLM", "device-1", "") !== null,
    true,
  );
});

Deno.test("validateActivationInput rejects invalid key format", () => {
  assertEquals(
    validateActivationInput("invalid-key", "device-1", "loogikasober"),
    "invalid_key_format",
  );
});

// --- checkLicenseValidity ---

Deno.test("checkLicenseValidity returns true for valid license", () => {
  assertEquals(checkLicenseValidity(makeLicense()), true);
});

Deno.test("checkLicenseValidity returns false for null license", () => {
  assertEquals(checkLicenseValidity(null), false);
});

Deno.test("checkLicenseValidity returns false for revoked license", () => {
  assertEquals(checkLicenseValidity(makeLicense({ is_revoked: true })), false);
});

Deno.test("checkLicenseValidity returns false for expired license", () => {
  assertEquals(
    checkLicenseValidity(makeLicense({ expires_at: "2020-01-01T00:00:00Z" })),
    false,
  );
});

// --- determineActivationResult ---

Deno.test("determineActivationResult returns active for already activated device", () => {
  const result = determineActivationResult(makeLicense(), 1, true);
  assertEquals(result.status, "active");
});

Deno.test("determineActivationResult returns active when under device limit", () => {
  const result = determineActivationResult(makeLicense(), 1, false);
  assertEquals(result.status, "active");
});

Deno.test("determineActivationResult returns device_limit_reached at max devices", () => {
  const result = determineActivationResult(makeLicense({ max_devices: 2 }), 2, false);
  assertEquals(result.status, "device_limit_reached");
  if (result.status === "device_limit_reached") {
    assertEquals(result.owner_email_hint, "k***a@gmail.com");
    assertEquals(result.manage_url, "https://minu.tarksober.ee");
  }
});

Deno.test("determineActivationResult returns device_limit_reached above max devices", () => {
  const result = determineActivationResult(makeLicense({ max_devices: 2 }), 5, false);
  assertEquals(result.status, "device_limit_reached");
});

Deno.test("determineActivationResult works with high max_devices (kindergarten)", () => {
  const result = determineActivationResult(
    makeLicense({ max_devices: 20 }),
    19,
    false,
  );
  assertEquals(result.status, "active");

  const result2 = determineActivationResult(
    makeLicense({ max_devices: 20 }),
    20,
    false,
  );
  assertEquals(result2.status, "device_limit_reached");
});

// --- validateEmailCollectionInput ---

Deno.test("validateEmailCollectionInput returns null for valid input", () => {
  assertEquals(
    validateEmailCollectionInput("token123", "user@example.com"),
    null,
  );
});

Deno.test("validateEmailCollectionInput rejects missing fields", () => {
  assertEquals(validateEmailCollectionInput("", "user@example.com") !== null, true);
  assertEquals(validateEmailCollectionInput("token", "") !== null, true);
});

Deno.test("validateEmailCollectionInput rejects invalid email", () => {
  assertEquals(
    validateEmailCollectionInput("token", "not-an-email"),
    "Invalid email format",
  );
});

// --- canCollectEmail ---

Deno.test("canCollectEmail returns ok for COMPLETED purchase", () => {
  assertEquals(canCollectEmail(makePurchase()).ok, true);
});

Deno.test("canCollectEmail rejects non-COMPLETED purchase", () => {
  const result = canCollectEmail(makePurchase({ mk_status: "CREATED" }));
  assertEquals(result.ok, false);
  assertEquals(result.reason?.includes("CREATED"), true);
});

Deno.test("canCollectEmail rejects CANCELLED purchase", () => {
  assertEquals(canCollectEmail(makePurchase({ mk_status: "CANCELLED" })).ok, false);
});

// --- calculateExpiresAt ---

Deno.test("calculateExpiresAt adds correct days", () => {
  const start = new Date("2026-01-01T00:00:00Z");
  const result = calculateExpiresAt(start, 90);
  assertEquals(result.toISOString(), "2026-04-01T00:00:00.000Z");
});

Deno.test("calculateExpiresAt handles 30 days", () => {
  const start = new Date("2026-03-01T00:00:00Z");
  const result = calculateExpiresAt(start, 30);
  assertEquals(result.toISOString(), "2026-03-31T00:00:00.000Z");
});

Deno.test("calculateExpiresAt handles 365 days", () => {
  const start = new Date("2026-01-01T12:00:00Z");
  const result = calculateExpiresAt(start, 365);
  assertEquals(result.toISOString(), "2027-01-01T12:00:00.000Z");
});

// --- isPremiumActive ---

Deno.test("isPremiumActive returns true for active, non-expired license", () => {
  const result = isPremiumActive([
    { is_active: true, license: makeLicense() },
  ]);
  assertEquals(result.is_premium, true);
  assertEquals(result.expires_at, "2026-12-31T23:59:59Z");
});

Deno.test("isPremiumActive returns false for no activations", () => {
  assertEquals(isPremiumActive([]).is_premium, false);
});

Deno.test("isPremiumActive returns false for inactive activation", () => {
  assertEquals(
    isPremiumActive([
      { is_active: false, license: makeLicense() },
    ]).is_premium,
    false,
  );
});

Deno.test("isPremiumActive returns false for expired license", () => {
  assertEquals(
    isPremiumActive([
      {
        is_active: true,
        license: makeLicense({ expires_at: "2020-01-01T00:00:00Z" }),
      },
    ]).is_premium,
    false,
  );
});

Deno.test("isPremiumActive returns false for revoked license", () => {
  assertEquals(
    isPremiumActive([
      { is_active: true, license: makeLicense({ is_revoked: true }) },
    ]).is_premium,
    false,
  );
});

Deno.test("isPremiumActive finds first valid among multiple", () => {
  const result = isPremiumActive([
    {
      is_active: true,
      license: makeLicense({ expires_at: "2020-01-01T00:00:00Z" }),
    },
    { is_active: true, license: makeLicense() },
  ]);
  assertEquals(result.is_premium, true);
});
