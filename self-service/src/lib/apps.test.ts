import { describe, it, expect } from "vitest";
import { APPS, checkoutTitle } from "./apps";

describe("checkoutTitle", () => {
  it("asks for support for Sõnasõber", () => {
    expect(checkoutTitle("sonasober")).toBe("Toeta Sõnasõbra arendust");
  });

  it("keeps the Loogikasõber supporter pack wording", () => {
    expect(checkoutTitle("loogikasober")).toBe("Toeta Loogikasõbra arendust");
  });

  it("falls back to a generic title for an unknown app", () => {
    expect(checkoutTitle("tundmatu")).toBe("Osta litsents");
  });
});

describe("APPS", () => {
  it("links each app to its own site", () => {
    expect(APPS.sonasober.url).toBe("https://sonasober.tarksober.ee");
    expect(APPS.loogikasober.url).toBe("https://loogikasober.tarksober.ee");
  });
});
