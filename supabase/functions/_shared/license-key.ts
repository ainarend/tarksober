export const LICENSE_KEY_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const KEY_PATTERN = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/;

export function generateLicenseKey(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);

  let result = "";
  for (let seg = 0; seg < 3; seg++) {
    if (seg > 0) result += "-";
    for (let i = 0; i < 4; i++) {
      const idx = bytes[seg * 4 + i] % LICENSE_KEY_CHARSET.length;
      result += LICENSE_KEY_CHARSET[idx];
    }
  }
  return result;
}

export function isValidLicenseKey(key: string): boolean {
  return KEY_PATTERN.test(key);
}
