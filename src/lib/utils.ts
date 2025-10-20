import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : value && typeof value === "object" && "toString" in value
      ? Number((value as { toString: () => string }).toString())
      : 0;

  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency: "IRR",
    maximumFractionDigits: 0,
  }).format(Math.round(numericValue));
}
