const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function isValidUuid(uuid: string): boolean {
  return UUID_PATTERN.test(uuid);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;

  if (local.length <= 1) {
    return `${local}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
