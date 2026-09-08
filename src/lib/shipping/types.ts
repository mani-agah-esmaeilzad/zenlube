export const SHIPPING_CURRENCY = "IRR" as const;
export const SHIPPING_FINGERPRINT_VERSION = "shipping-quote-v1" as const;

export type ShippingCurrency = typeof SHIPPING_CURRENCY;
export type ShippingDimensionsMode = "DEFAULT" | "CUSTOM";

export type ShippingDimensions = {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export type ShippingPackageItemInput = {
  productId: string;
  quantity: number;
  requiresShipping: boolean;
  weightGrams: number | null;
  dimensionsMode: ShippingDimensionsMode;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
};

export type ShippingPackageSettings = {
  basePackagingWeightGrams: number;
  extraPackagingWeightPerAdditionalItemGrams: number;
  minimumPackageWeightGrams: number;
  defaultLengthCm: number | null;
  defaultWidthCm: number | null;
  defaultHeightCm: number | null;
};

export type ShippingPackage = ShippingDimensions & {
  /** Total number of physical units, after applying cart quantities. */
  itemCount: number;
  /** Number of physical cart lines. */
  lineCount: number;
  contentWeightGrams: number;
  /** Packaging contribution after enforcing the configured minimum weight. */
  packagingWeightGrams: number;
  weightGrams: number;
};

export type ShippingPricingSettings = {
  /** Signed amount applied to the provider rate. */
  fixedAdjustmentRials: number;
  /** Signed percentage applied to the provider rate. */
  percentAdjustment: number;
  /** `null` disables free shipping; zero means every non-negative subtotal qualifies. */
  freeShippingThresholdRials: number | null;
};

export type ShippingPriceBreakdown = {
  currency: ShippingCurrency;
  basePriceRials: number;
  fixedAdjustmentRials: number;
  percentAdjustmentRials: number;
  adjustedPriceRials: number;
  freeShippingApplied: boolean;
  freeShippingDiscountRials: number;
  customerPriceRials: number;
};

export type ShippingDestinationFingerprintInput = {
  provinceCode: string;
  cityCode: string;
  postalCode: string;
  addressHash?: string | null;
};

export type ShippingFingerprintItemInput = ShippingPackageItemInput & {
  lineId?: string | null;
  variantId?: string | null;
  unitPriceRials: number;
  productVersion: string | number | Date;
};

export type ShippingFingerprintInput = {
  cartId: string;
  cartVersion: string | number | Date;
  items: readonly ShippingFingerprintItemInput[];
  destination: ShippingDestinationFingerprintInput;
  settingsVersion: string | number | Date;
  shippingPackage: ShippingPackage | null;
  pricingContext?: {
    couponCode: string | null;
    discountRials: number;
    declaredValueRials: number;
  };
};

export type ShippingCarrierCode = "POST" | "TIPAX" | "MANUAL";

export type ProviderQuoteRequest = {
  originExternalCityId: number;
  destinationExternalCityId: number;
  weightGrams: number;
  declaredValueRials: number;
  packageType: number;
};

export type NormalizedProviderQuote = {
  providerRequestId: string | null;
  carrierCode: Exclude<ShippingCarrierCode, "MANUAL">;
  carrierLabel: string;
  serviceCode: string;
  serviceLabel: string;
  basePriceRials: number;
  estimatedDeliveryLabel: string | null;
  estimatedMinDays: number | null;
  estimatedMaxDays: number | null;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
};

export type ProviderLocation = {
  externalId: number;
  name: string;
  externalParentId: number;
};

export type ProviderLocationTree = {
  provinces: ProviderLocation[];
  cities: ProviderLocation[];
};

export type ProviderShipmentRequest = {
  storeId: number;
  externalOrderNumber: number;
  recipientName: string;
  senderName: string;
  recipientMobile: string;
  senderMobile: string;
  recipientExternalCityId: number;
  recipientAddress: string;
  recipientPostalCode: string;
  weightGrams: number;
  declaredValueRials: number;
  productType: number;
  packageType: number;
  isLiquid: boolean;
  description?: string | null;
};

export type ProviderShipmentResult = {
  /** Some providers accept an external order number without returning their own record ID. */
  externalShipmentId: string | null;
  externalStatus: string | null;
};

export type ProviderTrackingResult = {
  externalOrderNumber: number;
  carrierLabel: string;
  amadastTrackingCode: string;
  carrierTrackingCode: string | null;
};
