export function normalizeIranPhone(rawPhone: string) {
  const digits = rawPhone.replace(/[^0-9+]/g, "");
  if (digits.startsWith("+98")) {
    return digits;
  }
  if (digits.startsWith("98") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0")) {
    return `+98${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    return `+98${digits}`;
  }
  return digits;
}

export function validateIranPhone(phone: string) {
  const normalized = normalizeIranPhone(phone);
  return /^\+989\d{9}$/.test(normalized);
}
