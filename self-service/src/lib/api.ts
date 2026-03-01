import { supabase } from "./supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";

async function callFunction<T>(
  name: string,
  options: {
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
    params?: Record<string, string>;
  } = {},
): Promise<T> {
  const { method = "GET", body, params } = options;

  // Append query params to function name for GET requests
  let path = name;
  if (params) {
    const searchParams = new URLSearchParams(params);
    path += `?${searchParams}`;
  }

  const { data, error } = await supabase.functions.invoke(path, {
    method,
    body: body || undefined,
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const errBody = await error.context.json().catch(() => null);
      throw new Error(errBody?.error || `HTTP ${error.context.status}`);
    }
    throw error;
  }

  return data as T;
}

// --- Public API ---

export interface Product {
  id: string;
  app_slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  duration_days: number;
  max_devices: number;
  sort_order: number;
}

export function getProducts(appSlug: string): Promise<Product[]> {
  return callFunction("get-products", { params: { app_slug: appSlug } });
}

export function getPaymentMethods(): Promise<any> {
  return callFunction("get-payment-methods");
}

export interface CheckoutResult {
  purchase_token: string;
  payment_methods: any;
  transaction_id: string;
}

export function createCheckout(productId: string): Promise<CheckoutResult> {
  return callFunction("create-checkout", {
    method: "POST",
    body: { product_id: productId },
  });
}

export interface CollectEmailResult {
  license_key: string;
  app_slug: string;
  expires_at: string;
}

export function collectEmail(
  purchaseToken: string,
  email: string,
): Promise<CollectEmailResult> {
  return callFunction("collect-email", {
    method: "POST",
    body: { purchase_token: purchaseToken, email },
  });
}

// --- Authenticated API ---

export interface LicenseWithDevices {
  id: string;
  license_key: string;
  app_slug: string;
  max_devices: number;
  starts_at: string;
  expires_at: string;
  is_revoked: boolean;
  is_expired: boolean;
  product: {
    name: string;
    description: string | null;
    duration_days: number;
  };
  active_device_count: number;
  devices: Array<{
    id: string;
    device_id: string;
    activated_at: string;
  }>;
}

export function linkAccount(): Promise<{ linked_count: number }> {
  return callFunction("link-account", { method: "POST" });
}

export function getMyLicenses(): Promise<LicenseWithDevices[]> {
  return callFunction("my-licenses");
}

export function deactivateDevice(
  activationId: string,
): Promise<{ ok: boolean }> {
  return callFunction("deactivate-device", {
    method: "POST",
    body: { activation_id: activationId },
  });
}
