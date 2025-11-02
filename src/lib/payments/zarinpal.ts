import { Prisma } from "@/generated/prisma";

const BASE_URL = process.env.ZARINPAL_BASE_URL ?? "https://api.zarinpal.com/pg/v4";
const START_PAY_URL = process.env.ZARINPAL_STARTPAY_URL ?? "https://www.zarinpal.com/pg/StartPay";

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

function ensureMerchantId() {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID;
  if (!merchantId) {
    throw new Error("شناسه پذیرنده زرین‌پال تنظیم نشده است.");
  }
  return merchantId;
}

function toTomans(amount: Prisma.Decimal | number) {
  const value = amount instanceof Prisma.Decimal ? amount.toNumber() : amount;
  return Math.round(value);
}

export async function requestZarinpalPayment(args: PaymentRequestArgs): Promise<PaymentRequestResult> {
  const merchantId = ensureMerchantId();
  const payload = {
    merchant_id: merchantId,
    amount: toTomans(args.amount),
    description: args.description,
    callback_url: args.callbackUrl,
    metadata: {
      email: args.email ?? undefined,
      mobile: args.phone ?? undefined,
      ...args.metadata,
    },
  };

  const response = await fetch(`${BASE_URL}/payment/request.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("خطا در ایجاد تراکنش زرین‌پال رخ داد.");
  }

  const data = (await response.json()) as {
    data?: { code?: number; authority?: string };
    errors?: { message: string }[];
  };

  if (!data.data || data.data.code !== 100 || !data.data.authority) {
    const errorMessage = data.errors?.[0]?.message ?? "پاسخ نامعتبر از زرین‌پال";
    throw new Error(errorMessage);
  }

  const authority = data.data.authority;
  return {
    authority,
    paymentUrl: `${START_PAY_URL}/${authority}`,
  };
}

export async function verifyZarinpalPayment(authority: string, amount: Prisma.Decimal | number): Promise<PaymentVerifyResult> {
  const merchantId = ensureMerchantId();
  const payload = {
    merchant_id: merchantId,
    amount: toTomans(amount),
    authority,
  };

  const response = await fetch(`${BASE_URL}/payment/verify.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("بررسی تراکنش زرین‌پال با خطا مواجه شد.");
  }

  const data = (await response.json()) as {
    data?: { code?: number; ref_id?: number; card_pan?: string };
    errors?: { message: string }[];
  };

  if (!data.data || (data.data.code !== 100 && data.data.code !== 101) || !data.data.ref_id) {
    const errorMessage = data.errors?.[0]?.message ?? "تایید تراکنش ناموفق بود.";
    throw new Error(errorMessage);
  }

  return {
    refId: data.data.ref_id.toString(),
    cardPan: data.data.card_pan,
  };
}
