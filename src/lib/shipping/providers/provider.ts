import type {
  NormalizedProviderQuote,
  ProviderLocationTree,
  ProviderQuoteRequest,
  ProviderShipmentRequest,
  ProviderShipmentResult,
  ProviderTrackingResult,
} from "@/lib/shipping/types";

export type ShippingProviderCapabilities = {
  quotes: boolean;
  locationSync: boolean;
  createShipment: boolean;
  trackingLookup: boolean;
  cancelShipment: boolean;
  label: boolean;
};

export interface ShippingProvider {
  readonly key: string;
  readonly capabilities: ShippingProviderCapabilities;
  quote(request: ProviderQuoteRequest, timeoutMs: number): Promise<NormalizedProviderQuote[]>;
  listLocations(timeoutMs: number): Promise<ProviderLocationTree>;
  createShipment(request: ProviderShipmentRequest, timeoutMs: number): Promise<ProviderShipmentResult>;
  lookupTracking(phone: string, timeoutMs: number): Promise<ProviderTrackingResult[]>;
}

export class ShippingProviderError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable = false,
    public readonly httpStatus?: number,
    /** True when a create request may have reached the provider but its result is unknown. */
    public readonly outcomeUnknown = false,
  ) {
    super(message);
    this.name = "ShippingProviderError";
  }
}
