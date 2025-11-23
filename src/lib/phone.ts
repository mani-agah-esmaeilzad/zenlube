const digitMap: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

function toEnglishDigits(value: string) {
  return value.replace(/[\u06F0-\u06F9\u0660-\u0669]/g, (char) => digitMap[char] ?? char);
}

export function normalizeIranPhone(rawPhone: string) {
  const digits = toEnglishDigits(rawPhone).replace(/[^0-9+]/g, "");
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
