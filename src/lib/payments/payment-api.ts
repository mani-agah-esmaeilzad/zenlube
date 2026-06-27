import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

type PaymentApiRequestResponse = {
  success?: boolean;
  paymentUrl?: string;
  authority?: string;
  message?: string;
  error?: string;
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

export async function requestExternalZarinpalPayment(orderId: string) {
  if (!config.PAYMENT_API_BASE_URL) {
    throw new Error("PAYMENT_API_BASE_URL تنظیم نشده است.");
  }

  const endpoint = `${normalizeBaseUrl(config.PAYMENT_API_BASE_URL)}/api/payments/zarinpal/request`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    logger.info("External payment API request", { orderId, endpoint });
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(config.PAYMENT_SERVICE_SECRET ? { "x-oilbar-payment-secret": config.PAYMENT_SERVICE_SECRET } : {}),
      },
      body: JSON.stringify({ orderId }),
      signal: controller.signal,
      cache: "no-store",
    });

    const data = (await response.json().catch(() => ({}))) as PaymentApiRequestResponse;

    if (!response.ok || !data.success || !data.paymentUrl) {
      const message = data.message ?? data.error ?? `Payment API HTTP ${response.status}`;
      logger.warn("External payment API failed", { orderId, status: response.status, message });
      throw new Error(message);
    }

    logger.info("External payment API response", { orderId, authority: data.authority });
    return { paymentUrl: data.paymentUrl, authority: data.authority };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    logger.error("External payment API network failed", { orderId, error: message, endpoint });
    throw new Error("اتصال به سرویس پرداخت برقرار نشد. لطفا چند دقیقه دیگر دوباره تلاش کنید.");
  } finally {
    clearTimeout(timeout);
  }
}
