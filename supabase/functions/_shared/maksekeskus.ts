export interface TransactionParams {
  amountCents: number;
  currency: string;
  reference: string;
  customerIp: string;
  returnUrl: string;
  cancelUrl: string;
  notificationUrl: string;
  locale?: string;
  country?: string;
}

export interface MaksekeskusTransaction {
  transaction: {
    amount: string;
    currency: string;
    reference: string;
  };
  customer: {
    ip: string;
    country: string;
    locale: string;
  };
  transaction_url: {
    return_url: string;
    cancel_url: string;
    notification_url: string;
  };
}

export function createAuthHeader(shopId: string, secretKey: string): string {
  return "Basic " + btoa(`${shopId}:${secretKey}`);
}

export async function verifyMac(
  jsonString: string,
  receivedMac: string,
  secretKey: string,
): Promise<boolean> {
  const data = new TextEncoder().encode(jsonString + secretKey);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedMac = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return computedMac === receivedMac;
}

export function buildTransactionPayload(
  params: TransactionParams,
): MaksekeskusTransaction {
  const euros = Math.floor(params.amountCents / 100);
  const cents = params.amountCents % 100;
  const amount = `${euros}.${cents.toString().padStart(2, "0")}`;

  return {
    transaction: {
      amount,
      currency: params.currency,
      reference: params.reference,
    },
    customer: {
      ip: params.customerIp,
      country: params.country ?? "ee",
      locale: params.locale ?? "et",
    },
    transaction_url: {
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      notification_url: params.notificationUrl,
    },
  };
}
