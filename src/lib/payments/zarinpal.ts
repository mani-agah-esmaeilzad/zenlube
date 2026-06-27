import { Prisma } from "@/generated/prisma";
import { config } from "../config";
import { logger } from "../logger";

const DEFAULT_BASE_URLS = [
  "https://payment.zarinpal.com/pg/v4",
  "https://api.zarinpal.com/pg/v4",
];

const DEFAULT_START_PAY_URL = "https://payment.zarinpal.com/pg/StartPay";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

function uniqueUrls(urls: string[]) {
  return [...new Set(urls.map(normalizeBaseUrl).filter(Boolean))];
}

const BASE_URLS = uniqueUrls([config.ZARINPAL_BASE_URL, ...DEFAULT_BASE_URLS]);
const START_PAY_URL = normalizeBaseUrl(
  config.ZARINPAL_STARTPAY_URL.replace("https://www.zarinpal.com", "https://payment.zarinpal.com") || DEFAULT_START_PAY_URL,
);

export type PaymentRequestArgs = {
  amount: Prisma.Decimal | number;
  description: string;
  callbackUrl: string;
  email?: string | null;
  phone?: string | null;
  metadata?: Record<string, unknown>;
};

export type PaymentRequestResult = {
  authority: string;
  paymentUrl: string;
};

export type PaymentVerifyResult = {
  refId: string;
  cardPan?: string;
};

type ZarinpalRequestResponse = {
  data?: { code?: number; authority?: string };
  errors?: Array<{ message?: string }> | { message?: string };
  raw?: string;
};

type ZarinpalVerifyResponse = {
  data?: { code?: number; ref_id?: number; card_pan?: string };
  errors?: Array<{ message?: string }> | { message?: string };
  raw?: string;
};

function toGatewayAmount(amount: Prisma.Decimal | number) {
  const value = amount instanceof Prisma.Decimal ? amount.toNumber() : amount;
  const toman = Math.round(value);
  return config.ZARINPAL_AMOUNT_UNIT === "rial" ? toman * 10 : toman;
}

function gatewayCurrency() {
  return config.ZARINPAL_AMOUNT_UNIT === "rial" ? "IRR" : "IRT";
}

function getErrorMessage(errors: ZarinpalRequestResponse["errors"]) {
  if (Array.isArray(errors)) return errors[0]?.message;
  return errors?.message;
}

async function postJsonWithFallback<T>(path: string, payload: unknown, label: string): Promise<{ data: T; endpoint: string }> {
  const failures: Array<{ endpoint: string; error: string }> = [];

  for (const baseUrl of BASE_URLS) {
    const endpoint = `${baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = (await response.json().catch(async () => ({ raw: await response.text() }))) as T;

      if (!response.ok) {
        failures.push({ endpoint, error: `HTTP ${response.status}` });
        logger.warn(`Zarinpal ${label} HTTP failed`, { endpoint, status: response.status, body: data });
        continue;
      }

      return { data, endpoint };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ endpoint, error: message });
      logger.warn(`Zarinpal ${label} network failed`, {
        endpoint,
        error: message,
        cause: error instanceof Error && "cause" in error ? String(error.cause) : undefined,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  logger.error(`Zarinpal ${label} failed on all endpoints`, { failures });
  throw new Error("ارتباط با زرین‌پال برقرار نشد. اگر این خطا در Vercel ادامه دارد، شبکه Vercel به زرین‌پال دسترسی ندارد و باید از سرور/پراکسی داخل ایران یا درگاه قابل دسترس از خارج استفاده شود.");
}

export async function requestZarinpalPayment(args: PaymentRequestArgs): Promise<PaymentRequestResult> {
  const payload = {
    merchant_id: config.ZARINPAL_MERCHANT_ID,
    amount: toGatewayAmount(args.amount),
    currency: gatewayCurrency(),
    description: args.description,
    callback_url: args.callbackUrl,
    metadata: {
      email: args.email ?? undefined,
      mobile: args.phone ?? undefined,
      ...args.metadata,
    },
  };

  logger.info("Payment init request", { gateway: "ZARINPAL", amount: payload.amount, callbackUrl: args.callbackUrl, endpoints: BASE_URLS });

  const { data, endpoint } = await postJsonWithFallback<ZarinpalRequestResponse>("/payment/request.json", payload, "request");

  if (!data.data || data.data.code !== 100 || !data.data.authority) {
    const errorMessage = getErrorMessage(data.errors) ?? "پاسخ نامعتبر از زرین‌پال دریافت شد.";
    logger.warn("Unexpected Zarinpal request response", { endpoint, payload: data });
    throw new Error(errorMessage);
  }

  const authority = data.data.authority;
  const paymentUrl = `${START_PAY_URL}/${authority}`;
  logger.info("Payment init response", { gateway: "ZARINPAL", authority, paymentUrl, endpoint });

  return { authority, paymentUrl };
}

export async function verifyZarinpalPayment(authority: string, amount: Prisma.Decimal | number): Promise<PaymentVerifyResult> {
  const payload = {
    merchant_id: config.ZARINPAL_MERCHANT_ID,
    amount: toGatewayAmount(amount),
    currency: gatewayCurrency(),
    authority,
  };

  logger.info("Payment verify request", { gateway: "ZARINPAL", authority, amount: payload.amount, endpoints: BASE_URLS });

  const { data, endpoint } = await postJsonWithFallback<ZarinpalVerifyResponse>("/payment/verify.json", payload, "verify");

  if (!data.data || (data.data.code !== 100 && data.data.code !== 101) || !data.data.ref_id) {
    const errorMessage = getErrorMessage(data.errors) ?? "تایید تراکنش ناموفق بود.";
    logger.warn("Unexpected Zarinpal verify response", { endpoint, payload: data });
    throw new Error(errorMessage);
  }

  logger.info("Payment verify result", { gateway: "ZARINPAL", authority, refId: data.data.ref_id, endpoint });
  return { refId: data.data.ref_id.toString(), cardPan: data.data.card_pan };
}
