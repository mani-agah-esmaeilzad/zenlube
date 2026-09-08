/**
 * Server-only module: it deliberately depends on Node's cryptography runtime.
 * Import it only from route handlers, server actions, jobs, or server tests.
 */
import { createHash } from "node:crypto";

import {
  SHIPPING_ERROR_CODES,
  ShippingDomainError,
} from "@/lib/shipping/errors";
import {
  SHIPPING_CURRENCY,
  SHIPPING_FINGERPRINT_VERSION,
  type ShippingFingerprintInput,
  type ShippingFingerprintItemInput,
} from "@/lib/shipping/types";

type CanonicalValue =
  | null
  | boolean
  | number
  | string
  | readonly CanonicalValue[]
  | { readonly [key: string]: CanonicalValue };

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function normalizeDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit);
    return String(persianIndex >= 0 ? persianIndex : ARABIC_DIGITS.indexOf(digit));
  });
}

function normalizeCode(value: string, field: string) {
  const normalized = normalizeDigits(value.normalize("NFKC")).trim();
  if (!normalized) {
    throw new ShippingDomainError(
      SHIPPING_ERROR_CODES.INVALID_FINGERPRINT_INPUT,
      `${field} is required to fingerprint a shipping quote`,
      { field },
    );
  }
  return normalized;
}

function normalizeVersion(value: string | number | Date, field: string) {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) {
      throw new ShippingDomainError(
        SHIPPING_ERROR_CODES.INVALID_FINGERPRINT_INPUT,
        `${field} contains an invalid date`,
        { field },
      );
    }
    return value.toISOString();
  }

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new ShippingDomainError(
        SHIPPING_ERROR_CODES.INVALID_FINGERPRINT_INPUT,
        `${field} must be a safe integer or a non-empty string`,
        { field },
      );
    }
    return value;
  }

  return normalizeCode(value, field);
}

function normalizeFingerprintItem(item: ShippingFingerprintItemInput) {
  if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
    throw new ShippingDomainError(
      SHIPPING_ERROR_CODES.INVALID_FINGERPRINT_INPUT,
      "Fingerprint item quantity must be a positive safe integer",
      { productId: item.productId },
    );
  }
  if (!Number.isSafeInteger(item.unitPriceRials) || item.unitPriceRials < 0) {
    throw new ShippingDomainError(
      SHIPPING_ERROR_CODES.INVALID_FINGERPRINT_INPUT,
      "Fingerprint item price must be a non-negative safe integer in IRR",
      { productId: item.productId },
    );
  }

  return {
    productId: normalizeCode(item.productId, "productId"),
    lineId: item.lineId == null ? null : normalizeCode(item.lineId, "lineId"),
    variantId: item.variantId == null ? null : normalizeCode(item.variantId, "variantId"),
    quantity: item.quantity,
    unitPriceRials: item.unitPriceRials,
    productVersion: normalizeVersion(item.productVersion, "productVersion"),
    requiresShipping: item.requiresShipping,
    weightGrams: item.weightGrams,
    dimensionsMode: item.dimensionsMode,
    lengthCm: item.lengthCm,
    widthCm: item.widthCm,
    heightCm: item.heightCm,
  } as const;
}

function canonicalize(value: unknown): CanonicalValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new ShippingDomainError(
        SHIPPING_ERROR_CODES.INVALID_FINGERPRINT_INPUT,
        "Fingerprint payload may contain only finite numbers",
      );
    }
    return Object.is(value, -0) ? 0 : value;
  }
  if (value instanceof Date) return normalizeVersion(value, "date");
  if (Array.isArray(value)) return value.map((entry) => canonicalize(entry));
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right, "en"))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }

  throw new ShippingDomainError(
    SHIPPING_ERROR_CODES.INVALID_FINGERPRINT_INPUT,
    `Unsupported fingerprint value type: ${typeof value}`,
  );
}

export function stableCanonicalJson(value: unknown) {
  return JSON.stringify(canonicalize(value));
}

export function buildShippingFingerprintPayload(input: ShippingFingerprintInput) {
  const items = input.items
    .map(normalizeFingerprintItem)
    .sort((left, right) => {
      const leftKey = stableCanonicalJson(left);
      const rightKey = stableCanonicalJson(right);
      return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
    });

  return {
    fingerprintVersion: SHIPPING_FINGERPRINT_VERSION,
    currency: SHIPPING_CURRENCY,
    cart: {
      id: normalizeCode(input.cartId, "cartId"),
      version: normalizeVersion(input.cartVersion, "cartVersion"),
      items,
    },
    destination: {
      provinceCode: normalizeCode(input.destination.provinceCode, "provinceCode"),
      cityCode: normalizeCode(input.destination.cityCode, "cityCode"),
      postalCode: normalizeCode(input.destination.postalCode, "postalCode")
        .replace(/[\s-]+/g, ""),
      addressHash: input.destination.addressHash == null
        ? null
        : normalizeCode(input.destination.addressHash, "addressHash"),
    },
    settingsVersion: normalizeVersion(input.settingsVersion, "settingsVersion"),
    package: input.shippingPackage,
    pricing: input.pricingContext ?? null,
  } as const;
}

export function createShippingFingerprint(input: ShippingFingerprintInput) {
  const payload = buildShippingFingerprintPayload(input);
  return createHash("sha256").update(stableCanonicalJson(payload)).digest("hex");
}
