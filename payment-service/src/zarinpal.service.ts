import { Prisma } from "../../src/generated/prisma";

const PAYMENT_BASE = "https://payment.zarinpal.com/pg/v4";
const PAYMENT_START = "https://payment.zarinpal.com/pg/StartPay";
const SANDBOX_BASE = "https://sandbox.zarinpal.com/pg/v4";
const SANDBOX_START = "https://sandbox.zarinpal.com/pg/StartPay";

type ZarinpalRequestResponse = {
  data?: { code?: number; authority?: string };
  errors?: Array<{ message?: string; code?: string | number }> | { message?: string; code?: string | number };
};

type ZarinpalVerifyResponse = {
  data?: { code?: number; ref_id?: number; card_pan?: string };
  errors?: Array<{ message?: string; code?: string | number }> | { message?: string; code?: string | number };
};

export type ZarinpalRequestResult = {
  authority: string;
  paymentUrl: string;
  payload: Record<string, unknown>;
  response: ZarinpalRequestResponse;
};

export type ZarinpalVerifyResult = {
  refId: string;
  cardPan?: string;
  payload: Record<string, unknown>;
  response: ZarinpalVerifyResponse;
};

function env(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

function isSandbox() {
  return env("ZARINPAL_SANDBOX", "false") === "true";
}

function amountUnit() {
  return env("ZARINPAL_AMOUNT_UNIT", "toman");
}

function gatewayCurrency() {
  return amountUnit() === "rial" ? "IRR" : "IRT";
}

function toGatewayAmount(amount: Prisma.Decimal | number) {
  const value = amount instanceof Prisma.Decimal ? amount.toNumber() : amount;
  const toman = Math.round(value);
  return amountUnit() === "rial" ? toman * 10 : toman;
}

function gatewayBaseUrl() {
  return (isSandbox() ? SANDBOX_BASE : env("ZARINPAL_BASE_URL", PAYMENT_BASE)).replace(/\/$/, "");
}

function startPayUrl(authority: string) {
  const base = (isSandbox() ? SANDBOX_START : env("ZARINPAL_STARTPAY_URL", PAYMENT_START)).replace(/\/$/, "");
  return `${base}/${authority}`;
}

function merchantId() {
  const value = env("ZARINPAL_MERCHANT_ID");
  if (!value) {
    throw new Error("ZARINPAL_MERCHANT_ID تنظیم نشده است.");
  }
  return value;
}

function errorMessage(errors: ZarinpalRequestResponse["errors"]) {
  if (Array.isArray(errors)) return errors[0]?.message;
  return errors?.message;
}

async function postJson<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${gatewayBaseUrl()}${path}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => ({}))) as T;
    if (!response.ok) {
      throw new Error(`ZarinPal HTTP ${response.status}`);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestZarinpalPayment(args: {
  amount: Prisma.Decimal | number;
  callbackUrl: string;
  description: string;
  email?: string | null;
  phone?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<ZarinpalRequestResult> {
  const payload = {
    merchant_id: merchantId(),
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

  const response = await postJson<ZarinpalRequestResponse>("/payment/request.json", payload);
  if (!response.data || response.data.code !== 100 || !response.data.authority) {
    throw new Error(errorMessage(response.errors) ?? "درخواست پرداخت زرین‌پال ناموفق بود.");
  }

  return {
    authority: response.data.authority,
    paymentUrl: startPayUrl(response.data.authority),
    payload,
    response,
  };
}

export async function verifyZarinpalPayment(authority: string, amount: Prisma.Decimal | number): Promise<ZarinpalVerifyResult> {
  const payload = {
    merchant_id: merchantId(),
    amount: toGatewayAmount(amount),
    currency: gatewayCurrency(),
    authority,
  };

  const response = await postJson<ZarinpalVerifyResponse>("/payment/verify.json", payload);
  if (!response.data || (response.data.code !== 100 && response.data.code !== 101) || !response.data.ref_id) {
    throw new Error(errorMessage(response.errors) ?? "تایید پرداخت زرین‌پال ناموفق بود.");
  }

  return {
    refId: response.data.ref_id.toString(),
    cardPan: response.data.card_pan,
    payload,
    response,
  };
}
