import { NextResponse } from "next/server";

import { config } from "@/lib/config";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getAppSession } from "@/lib/session";
import { requestShippingQuote, ShippingServiceError } from "@/lib/shipping/service";
import { shippingQuoteSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set([new URL(request.url).origin, new URL(config.NEXT_PUBLIC_APP_URL).origin]);
  if ((origin && !allowedOrigins.has(origin)) || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ success: false, message: "درخواست نامعتبر است." }, { status: 403 });
  }

  const session = await getAppSession();
  const userId = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!userId) {
    return NextResponse.json({ success: false, message: "برای محاسبه ارسال ابتدا وارد شوید." }, { status: 401 });
  }

  const rateLimit = await consumeRateLimit(
    `shipping-quote:${userId}`,
    config.SHIPPING_QUOTE_RATE_LIMIT_WINDOW,
    config.SHIPPING_QUOTE_RATE_LIMIT_MAX,
  );
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, message: "تعداد استعلام‌ها زیاد است؛ کمی بعد دوباره تلاش کنید." },
      { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000))) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = shippingQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({
      success: false,
      message: "اطلاعات آدرس را بررسی کنید.",
      errors: parsed.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  try {
    const result = await requestShippingQuote(userId, parsed.data, parsed.data.couponCode);
    return NextResponse.json({ success: true, data: result }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    const known = error instanceof ShippingServiceError;
    return NextResponse.json({
      success: false,
      code: known ? error.code : "UNKNOWN",
      message: known ? error.message : "محاسبه هزینه ارسال با خطا روبه‌رو شد.",
      retryable: known ? error.retryable : true,
    }, { status: known ? error.status : 500, headers: { "Cache-Control": "no-store" } });
  }
}
