export const SHIPPING_ERROR_CODES = {
  INVALID_INPUT: "INVALID_INPUT",
  INVALID_CART_QUANTITY: "INVALID_CART_QUANTITY",
  MISSING_PRODUCT_WEIGHT: "MISSING_PRODUCT_WEIGHT",
  INVALID_PRODUCT_WEIGHT: "INVALID_PRODUCT_WEIGHT",
  MISSING_PRODUCT_DIMENSIONS: "MISSING_PRODUCT_DIMENSIONS",
  INVALID_PRODUCT_DIMENSIONS: "INVALID_PRODUCT_DIMENSIONS",
  INVALID_PACKAGE_SETTINGS: "INVALID_PACKAGE_SETTINGS",
  INVALID_MONEY: "INVALID_MONEY",
  INVALID_PRICING_SETTINGS: "INVALID_PRICING_SETTINGS",
  INVALID_FINGERPRINT_INPUT: "INVALID_FINGERPRINT_INPUT",
} as const;

export type ShippingErrorCode =
  (typeof SHIPPING_ERROR_CODES)[keyof typeof SHIPPING_ERROR_CODES];

export class ShippingDomainError extends Error {
  readonly code: ShippingErrorCode;
  readonly context?: Readonly<Record<string, string | number | boolean | null>>;

  constructor(
    code: ShippingErrorCode,
    message: string,
    context?: Readonly<Record<string, string | number | boolean | null>>,
  ) {
    super(message);
    this.name = "ShippingDomainError";
    this.code = code;
    this.context = context;
  }
}

export function isShippingDomainError(error: unknown): error is ShippingDomainError {
  return error instanceof ShippingDomainError;
}
