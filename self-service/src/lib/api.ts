import { supabase } from "./supabase";

const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : "";

async function callFunction<T>(
  name: string,
  options: {
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
    params?: Record<string, string>;
    auth?: boolean;
  } = {},
): Promise<T> {
  const { method = "GET", body, params, auth = false } = options;

  let url = `${FUNCTIONS_BASE}/${name}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  };

  if (auth) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("NOT_AUTHENTICATED");
    }
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("NOT_AUTHENTICATED");
    }
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
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
  return callFunction("link-account", { method: "POST", auth: true });
}

export function getMyLicenses(): Promise<LicenseWithDevices[]> {
  return callFunction("my-licenses", { auth: true });
}

export function deactivateDevice(
  activationId: string,
): Promise<{ ok: boolean }> {
  return callFunction("deactivate-device", {
    method: "POST",
    auth: true,
    body: { activation_id: activationId },
  });
}
