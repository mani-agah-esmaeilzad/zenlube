import { Prisma } from "@/generated/prisma";
import { config } from "../config";
import { logger } from "../logger";

const BASE_URL = config.ZARINPAL_BASE_URL.replace("https://api.zarinpal.com", "https://payment.zarinpal.com");
const START_PAY_URL = config.ZARINPAL_STARTPAY_URL.replace("https://www.zarinpal.com", "https://payment.zarinpal.com");

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

function toGatewayAmount(amount: Prisma.Decimal | number) {
  const value = amount instanceof Prisma.Decimal ? amount.toNumber() : amount;
  const toman = Math.round(value);
  return config.ZARINPAL_AMOUNT_UNIT === "rial" ? toman * 10 : toman;
}

function gatewayCurrency() {
  return config.ZARINPAL_AMOUNT_UNIT === "rial" ? "IRR" : "IRT";
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

  logger.info("Payment init request", { gateway: "ZARINPAL", amount: payload.amount, callbackUrl: args.callbackUrl });

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/payment/request.json`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    logger.error("Zarinpal request network failed", {
      endpoint: `${BASE_URL}/payment/request.json`,
      error: error instanceof Error ? error.message : error,
      cause: error instanceof Error && "cause" in error ? String(error.cause) : undefined,
    });
    throw new Error("ارتباط با زرین‌پال برقرار نشد. لطفا چند لحظه بعد دوباره تلاش کنید.");
  }

  const data = (await response.json().catch(async () => ({ raw: await response.text() }))) as {
    data?: { code?: number; authority?: string };
    errors?: Array<{ message?: string }>;
    raw?: string;
  };

  if (!response.ok) {
    logger.error("Zarinpal request failed", { status: response.status, body: data });
    throw new Error("اتصال به درگاه پرداخت ناموفق بود. لطفا دوباره تلاش کنید.");
  }

  if (!data.data || data.data.code !== 100 || !data.data.authority) {
    const errorMessage = data.errors?.[0]?.message ?? "پاسخ نامعتبر از زرین‌پال دریافت شد.";
    logger.warn("Unexpected Zarinpal request response", { payload: data });
    throw new Error(errorMessage);
  }

  const authority = data.data.authority;
  const paymentUrl = `${START_PAY_URL}/${authority}`;
  logger.info("Payment init response", { gateway: "ZARINPAL", authority, paymentUrl });

  return { authority, paymentUrl };
}

export async function verifyZarinpalPayment(authority: string, amount: Prisma.Decimal | number): Promise<PaymentVerifyResult> {
  const payload = {
    merchant_id: config.ZARINPAL_MERCHANT_ID,
    amount: toGatewayAmount(amount),
    currency: gatewayCurrency(),
    authority,
  };

  logger.info("Payment verify request", { gateway: "ZARINPAL", authority, amount: payload.amount });

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/payment/verify.json`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    logger.error("Zarinpal verification network failed", {
      endpoint: `${BASE_URL}/payment/verify.json`,
      error: error instanceof Error ? error.message : error,
      cause: error instanceof Error && "cause" in error ? String(error.cause) : undefined,
    });
    throw new Error("ارتباط با زرین‌پال برای تایید پرداخت برقرار نشد.");
  }

  const data = (await response.json().catch(async () => ({ raw: await response.text() }))) as {
    data?: { code?: number; ref_id?: number; card_pan?: string };
    errors?: Array<{ message?: string }>;
    raw?: string;
  };

  if (!response.ok) {
    logger.error("Zarinpal verification failed", { status: response.status, body: data });
    throw new Error("بررسی تراکنش زرین‌پال با خطا مواجه شد.");
  }

  if (!data.data || (data.data.code !== 100 && data.data.code !== 101) || !data.data.ref_id) {
    const errorMessage = data.errors?.[0]?.message ?? "تایید تراکنش ناموفق بود.";
    logger.warn("Unexpected Zarinpal verify response", { payload: data });
    throw new Error(errorMessage);
  }

  logger.info("Payment verify result", { gateway: "ZARINPAL", authority, refId: data.data.ref_id });
  return { refId: data.data.ref_id.toString(), cardPan: data.data.card_pan };
}
