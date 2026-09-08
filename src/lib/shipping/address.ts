const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function normalizeAddressDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit);
    return String(persianIndex >= 0 ? persianIndex : ARABIC_DIGITS.indexOf(digit));
  });
}

export function normalizeIranPostalCode(value: string) {
  return normalizeAddressDigits(value).replace(/\D/g, "");
}

export function isValidIranPostalCode(value: string) {
  return /^\d{10}$/.test(normalizeIranPostalCode(value));
}
