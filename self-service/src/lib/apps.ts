export interface AppInfo {
  name: string;
  /** Genitive form, as in "Toeta Sõnasõbra arendust". */
  genitive: string;
  url: string;
}

export const APPS: Record<string, AppInfo> = {
  loogikasober: { name: "Loogikasõber", genitive: "Loogikasõbra", url: "https://loogikasober.tarksober.ee" },
  sonasober: { name: "Sõnasõber", genitive: "Sõnasõbra", url: "https://sonasober.tarksober.ee" },
  unesober: { name: "Unesõber", genitive: "Unesõbra", url: "https://unesober.tarksober.ee" },
};

/** Set by Checkout so the pages after the bank redirect know what was paid for. */
export const CHECKOUT_APP_KEY = "checkout_app_slug";
export const CHECKOUT_KIND_KEY = "checkout_kind";

export function checkoutTitle(appSlug: string): string {
  const app = APPS[appSlug];
  return app ? `Toeta ${app.genitive} arendust` : "Osta litsents";
}
