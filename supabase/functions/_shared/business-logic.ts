import { generateLicenseKey, isValidLicenseKey } from "./license-key.ts";
import { isValidEmail, isValidUuid, maskEmail } from "./validation.ts";

// Types matching our database schema
export interface Product {
  id: string;
  app_slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  duration_days: number;
  max_devices: number;
  is_active: boolean;
  sort_order: number;
}

export interface License {
  id: string;
  license_key: string;
  product_id: string;
  owner_email: string;
  user_id: string | null;
  app_slug: string;
  max_devices: number;
  starts_at: string;
  expires_at: string;
  is_revoked: boolean;
}

export interface DeviceActivation {
  id: string;
  license_id: string;
  device_id: string;
  activated_at: string;
  is_active: boolean;
  deactivated_at: string | null;
}

export interface Purchase {
  id: string;
  product_id: string;
  purchase_token: string;
  mk_transaction_id: string | null;
  mk_status: string;
  mk_amount_cents: number;
  customer_email: string | null;
  license_id: string | null;
}

// --- Activation Logic ---

export type ActivationResult =
  | { status: "active"; expires_at: string }
  | { status: "invalid" }
  | { status: "device_limit_reached"; owner_email_hint: string; manage_url: string };

export function validateActivationInput(
  licenseKey: string,
  deviceId: string,
  appSlug: string,
): string | null {
  if (!licenseKey || !deviceId || !appSlug) {
    return "license_key, device_id, and app_slug are required";
  }
  if (!isValidLicenseKey(licenseKey)) {
    return "invalid_key_format";
  }
  return null;
}

export function checkLicenseValidity(license: License | null): boolean {
  if (!license) return false;
  if (license.is_revoked) return false;
  if (new Date(license.expires_at) <= new Date()) return false;
  return true;
}

export function determineActivationResult(
  license: License,
  activeDeviceCount: number,
  deviceAlreadyActive: boolean,
): ActivationResult {
  if (deviceAlreadyActive) {
    return { status: "active", expires_at: license.expires_at };
  }

  if (activeDeviceCount >= license.max_devices) {
    return {
      status: "device_limit_reached",
      owner_email_hint: maskEmail(license.owner_email),
      manage_url: "https://minu.tarksober.ee",
    };
  }

  return { status: "active", expires_at: license.expires_at };
}

// --- Email Collection Logic ---

export function validateEmailCollectionInput(
  purchaseToken: string,
  email: string,
): string | null {
  if (!purchaseToken || !email) return "purchase_token and email are required";
  if (!isValidEmail(email)) return "Invalid email format";
  return null;
}

export function canCollectEmail(purchase: Purchase): { ok: boolean; reason?: string } {
  if (purchase.mk_status !== "COMPLETED") {
    return { ok: false, reason: `Payment not completed (status: ${purchase.mk_status})` };
  }
  return { ok: true };
}

export function calculateExpiresAt(startDate: Date, durationDays: number): Date {
  return new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
}

// --- Premium Status Logic ---

export function isPremiumActive(
  activations: Array<{ is_active: boolean; license: License }>,
): { is_premium: boolean; expires_at?: string } {
  const now = new Date();

  for (const act of activations) {
    if (
      act.is_active &&
      !act.license.is_revoked &&
      new Date(act.license.expires_at) > now
    ) {
      return { is_premium: true, expires_at: act.license.expires_at };
    }
  }

  return { is_premium: false };
}
