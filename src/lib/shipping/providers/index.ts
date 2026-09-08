import { config } from "@/lib/config";
import { amadastProvider } from "@/lib/shipping/providers/amadast";
import { mockShippingProvider } from "@/lib/shipping/providers/mock";
import { ShippingProviderError, type ShippingProvider } from "@/lib/shipping/providers/provider";

export function getShippingProvider(): ShippingProvider {
  if (config.SHIPPING_PROVIDER === "amadast") return amadastProvider;
  if (config.SHIPPING_PROVIDER === "mock") {
    if (config.NODE_ENV === "production") {
      throw new ShippingProviderError("INVALID_CONFIG", "سرویس آزمایشی ارسال در محیط اصلی مجاز نیست.");
    }
    return mockShippingProvider;
  }
  throw new ShippingProviderError("DISABLED", "محاسبه آنلاین ارسال هنوز فعال نشده است.");
}

export type { ShippingProvider, ShippingProviderCapabilities } from "@/lib/shipping/providers/provider";
export { ShippingProviderError } from "@/lib/shipping/providers/provider";
