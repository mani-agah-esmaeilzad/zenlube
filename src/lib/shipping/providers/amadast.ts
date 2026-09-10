import { z } from "zod";

import { config } from "@/lib/config";
import type {
  NormalizedProviderQuote,
  ProviderLocation,
  ProviderLocationTree,
  ProviderQuoteRequest,
  ProviderShipmentRequest,
  ProviderShipmentResult,
  ProviderTrackingResult,
} from "@/lib/shipping/types";
import {
  ShippingProviderError,
  type ShippingProvider,
} from "@/lib/shipping/providers/provider";

const AMADAST_POST_ID = 13;
const AMADAST_TIPAX_ID = 4;
const POLL_INTERVAL_MS = 250;
const LOCATION_SYNC_DEADLINE_MS = 20_000;
const LOCATION_REQUEST_TIMEOUT_MS = 6_000;
const LOCATION_REQUEST_CONCURRENCY = 6;

const responseEnvelopeSchema = z.object({
  success: z.boolean().optional(),
  result: z.boolean().optional(),
  message: z.union([z.string(), z.array(z.string()), z.null()]).optional(),
  errors: z.union([z.string(), z.array(z.string()), z.null()]).optional(),
  data: z.unknown().optional(),
}).passthrough();

const estimateStartSchema = responseEnvelopeSchema.extend({
  data: z.object({ request_id: z.string().min(1) }).passthrough(),
});

const nonnegativeIntegerLikeSchema = z.union([z.string(), z.number()]).refine((value) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0;
});

const estimateItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  shipping_method: z.union([z.string(), z.number()]).nullish(),
  title: z.string().nullish(),
  name: z.string().nullish(),
  price: nonnegativeIntegerLikeSchema,
  discounted_price: nonnegativeIntegerLikeSchema.nullish(),
  description: z.string().nullish(),
  discount_percent: nonnegativeIntegerLikeSchema.nullish(),
}).passthrough();

const cityItemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  // Province rows in Amadast's official response example use `null` here.
  // City rows contain the numeric province id.
  parent: z.number().int().nonnegative().nullable(),
  location: z.string().nullish(),
}).passthrough();

const cityEnvelopeSchema = responseEnvelopeSchema.extend({
  data: z.union([
    z.array(cityItemSchema),
    cityItemSchema,
  ]),
});

const tokenEnvelopeSchema = responseEnvelopeSchema.extend({
  data: z.object({
    token_type: z.string(),
    access_token: z.string().min(1),
    expires_in: z.number().int().positive(),
    refresh_token: z.string().optional(),
  }).passthrough(),
});

const createOrderEnvelopeSchema = responseEnvelopeSchema.extend({
  // The official schema returns the accepted CreateOrder payload. Some live
  // responses may additionally include an internal id, so keep it optional.
  data: z.record(z.string(), z.unknown()),
});

const trackingEnvelopeSchema = responseEnvelopeSchema.extend({
  data: z.array(z.object({
    amadast_tracking_code: z.string(),
    courier_tracking_code: z.string().nullish(),
    courier_title: z.string(),
    external_order_id: z.number().int(),
    phone_number: z.string(),
  }).passthrough()).nullable(),
});

let cachedToken: { value: string; expiresAt: number } | null = null;

function safeBaseUrl() {
  const url = new URL(config.AMADAST_API_BASE_URL);
  if (url.protocol !== "https:" && config.NODE_ENV === "production") {
    throw new ShippingProviderError("INVALID_CONFIG", "آدرس سرویس آمادست باید امن باشد.");
  }
  return url.toString().replace(/\/$/, "");
}

function safeCalculatorBaseUrl() {
  const url = new URL(config.AMADAST_CALCULATOR_BASE_URL);
  if (url.protocol !== "https:" && config.NODE_ENV === "production") {
    throw new ShippingProviderError("INVALID_CONFIG", "آدرس محاسبه‌گر آمادست باید امن باشد.");
  }
  return url.toString().replace(/\/$/, "");
}

function storefrontOrigin() {
  try {
    return new URL(config.NEXT_PUBLIC_APP_URL).origin;
  } catch {
    throw new ShippingProviderError("INVALID_CONFIG", "آدرس عمومی فروشگاه معتبر نیست.");
  }
}

function clientCode() {
  if (!config.AMADAST_CLIENT_CODE?.trim()) {
    throw new ShippingProviderError("NOT_CONFIGURED", "کلید اتصال آمادست تنظیم نشده است.");
  }
  return config.AMADAST_CLIENT_CODE.trim();
}

function providerMessage(payload: unknown) {
  const parsed = responseEnvelopeSchema.safeParse(payload);
  const message = parsed.success ? parsed.data.message ?? parsed.data.errors : null;
  if (Array.isArray(message)) return message.join(" ").slice(0, 300);
  return typeof message === "string" ? message.slice(0, 300) : null;
}

async function requestJson(
  path: string,
  init: RequestInit,
  timeoutMs: number,
  retrySafe = false,
  deadlineAt?: number,
  baseUrl = safeBaseUrl(),
) {
  const attempts = retrySafe ? 2 : 1;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    init.signal?.throwIfAborted();
    const remainingMs = deadlineAt == null ? Infinity : deadlineAt - Date.now();
    if (remainingMs <= 0) {
      throw new ShippingProviderError("TIMEOUT", "زمان همگام‌سازی شهرهای آمادست به پایان رسید.", true);
    }
    const controller = new AbortController();
    const abort = () => controller.abort();
    init.signal?.addEventListener("abort", abort, { once: true });
    const timeout = setTimeout(abort, Math.min(remainingMs, Math.max(1, timeoutMs)));
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        cache: "no-store",
        signal: controller.signal,
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt + 1 < attempts) {
          await new Promise((resolve) => setTimeout(resolve, 150 + Math.floor(Math.random() * 100)));
          continue;
        }
        throw new ShippingProviderError(
          response.status === 401 || response.status === 403 ? "AUTH_FAILED" : "HTTP_ERROR",
          providerMessage(body) ?? "پاسخ نامعتبر از سرویس آمادست دریافت شد.",
          retryable,
          response.status,
        );
      }
      return body;
    } catch (error) {
      lastError = error;
      if (error instanceof ShippingProviderError) throw error;
      if (attempt + 1 < attempts) continue;
    } finally {
      clearTimeout(timeout);
      init.signal?.removeEventListener("abort", abort);
    }
  }

  throw new ShippingProviderError(
    "NETWORK_ERROR",
    lastError instanceof Error && lastError.name === "AbortError"
      ? "زمان پاسخ‌گویی آمادست به پایان رسید."
      : "ارتباط با سرویس آمادست برقرار نشد.",
    true,
  );
}

function baseHeaders(withJson = false): Record<string, string> {
  return {
    Accept: "application/json",
    "X-Client-Code": clientCode(),
    ...(withJson ? { "Content-Type": "application/json" } : {}),
  };
}

function calculatorHeaders(withJson = false): Record<string, string> {
  const origin = storefrontOrigin();
  return {
    Accept: "application/json",
    "User-Agent": "Oilbar/1.0",
    Origin: origin,
    Referer: `${origin}/`,
    ...(withJson ? { "Content-Type": "application/json" } : {}),
  };
}

export function classifyAmadastCreateDispatchError(error: unknown) {
  if (error instanceof ShippingProviderError) {
    const definiteClientRejection = error.httpStatus != null && error.httpStatus >= 400 && error.httpStatus < 500;
    if (definiteClientRejection) {
      return new ShippingProviderError("CREATE_REJECTED", error.message, true, error.httpStatus);
    }
    return new ShippingProviderError("CREATE_OUTCOME_UNKNOWN", error.message, false, error.httpStatus, true);
  }
  return new ShippingProviderError(
    "CREATE_OUTCOME_UNKNOWN",
    error instanceof Error ? error.message : "نتیجه ثبت سفارش در آمادست مشخص نشد.",
    false,
    undefined,
    true,
  );
}

async function accessToken(timeoutMs: number) {
  if (config.AMADAST_ACCESS_TOKEN?.trim()) return config.AMADAST_ACCESS_TOKEN.trim();
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const userId = Number(config.AMADAST_USER_ID);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ShippingProviderError("NOT_CONFIGURED", "شناسه کاربر آمادست تنظیم نشده است.");
  }

  const payload = await requestJson(
    `/v1/auth/token/${userId}`,
    { method: "POST", headers: baseHeaders() },
    timeoutMs,
    false,
  );
  const parsed = tokenEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ShippingProviderError("INVALID_RESPONSE", "پاسخ ورود آمادست قابل اعتبارسنجی نیست.");
  }
  cachedToken = {
    value: parsed.data.data.access_token,
    expiresAt: Date.now() + parsed.data.data.expires_in * 1000,
  };
  return cachedToken.value;
}

async function authenticatedHeaders(timeoutMs: number, withJson = false) {
  return {
    ...baseHeaders(withJson),
    Authorization: `Bearer ${await accessToken(timeoutMs)}`,
  };
}

function positiveInteger(value: string | number | null | undefined) {
  if (value == null || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function carrierForItem(item: z.infer<typeof estimateItemSchema>) {
  const method = positiveInteger(item.shipping_method);
  const id = positiveInteger(item.id);
  const label = item.title ?? item.name ?? "";
  if (method === AMADAST_POST_ID || id === AMADAST_POST_ID || label.includes("پیشتاز")) {
    return { code: "POST" as const, label: "پست" };
  }
  if (method === AMADAST_TIPAX_ID || id === AMADAST_TIPAX_ID || /tipax/i.test(label) || label.includes("تیپاکس")) {
    return { code: "TIPAX" as const, label: "تیپاکس" };
  }
  return null;
}

function extractEstimateState(payload: unknown) {
  const envelope = responseEnvelopeSchema.safeParse(payload);
  if (!envelope.success || typeof envelope.data.data !== "object" || envelope.data.data === null) {
    throw new ShippingProviderError("INVALID_RESPONSE", "پاسخ قیمت آمادست قابل اعتبارسنجی نیست.");
  }
  const outer = envelope.data.data as Record<string, unknown>;
  const nested = typeof outer.data === "object" && outer.data !== null
    ? outer.data as Record<string, unknown>
    : outer;
  const rawItems = Array.isArray(nested.items) ? nested.items : null;
  const progress = typeof outer.progress_detail === "object" && outer.progress_detail !== null
    ? outer.progress_detail as Record<string, unknown>
    : null;
  const percent = progress && typeof progress.percent === "number" ? progress.percent : null;

  if (!rawItems) return { complete: percent != null && percent >= 100, items: [] as z.infer<typeof estimateItemSchema>[] };
  const items = z.array(estimateItemSchema).safeParse(rawItems);
  if (!items.success) {
    throw new ShippingProviderError("INVALID_RESPONSE", "جزئیات قیمت آمادست قابل اعتبارسنجی نیست.");
  }
  return { complete: true, items: items.data };
}

function normalizeEstimateItem(
  item: z.infer<typeof estimateItemSchema>,
  providerRequestId: string,
): NormalizedProviderQuote | null {
  const carrier = carrierForItem(item);
  if (!carrier) return null;
  const discounted = positiveInteger(item.discounted_price);
  const regular = positiveInteger(item.price);
  const price = discounted ?? regular;
  if (price == null || price <= 0) return null;
  const serviceCode = String(item.id);
  const serviceLabel = (item.title ?? item.name)?.trim() || carrier.label;
  return {
    providerRequestId,
    carrierCode: carrier.code,
    carrierLabel: carrier.label,
    serviceCode,
    serviceLabel,
    basePriceRials: price,
    estimatedDeliveryLabel: null,
    estimatedMinDays: null,
    estimatedMaxDays: null,
    metadata: {
      amadastServiceId: serviceCode,
      amadastShippingMethod: positiveInteger(item.shipping_method),
      discountPercent: positiveInteger(item.discount_percent),
    },
  };
}

export function normalizeAmadastEstimatePayload(payload: unknown, providerRequestId: string) {
  const state = extractEstimateState(payload);
  const options = state.items
    .map((item) => normalizeEstimateItem(item, providerRequestId))
    .filter((item): item is NormalizedProviderQuote => item !== null);
  return { complete: state.complete, options };
}

async function quote(request: ProviderQuoteRequest, timeoutMs: number) {
  const startedAt = Date.now();
  const calculatorBaseUrl = safeCalculatorBaseUrl();
  const courierIds = request.carrierCodes.map((carrier) => (
    carrier === "POST" ? AMADAST_POST_ID : AMADAST_TIPAX_ID
  ));
  const startPayload = await requestJson(
    "",
    {
      method: "POST",
      headers: calculatorHeaders(true),
      body: JSON.stringify({
        from_city: request.originExternalCityId,
        to_city: request.destinationExternalCityId,
        weight: request.weightGrams,
        value: request.declaredValueRials,
        package_type: request.packageType,
        couriers: courierIds,
        meta_data: {
          integration: "oilbar",
          site_url: storefrontOrigin(),
        },
      }),
    },
    timeoutMs,
    false,
    undefined,
    calculatorBaseUrl,
  );
  const start = estimateStartSchema.safeParse(startPayload);
  if (!start.success) {
    throw new ShippingProviderError("INVALID_RESPONSE", "شناسه استعلام از آمادست دریافت نشد.");
  }

  const requestId = start.data.data.request_id;
  while (Date.now() - startedAt < timeoutMs) {
    const remaining = Math.max(500, timeoutMs - (Date.now() - startedAt));
    const pollPayload = await requestJson(
      `/${encodeURIComponent(requestId)}`,
      { method: "GET", headers: calculatorHeaders() },
      remaining,
      true,
      undefined,
      calculatorBaseUrl,
    );
    const state = normalizeAmadastEstimatePayload(pollPayload, requestId);
    if (state.complete) {
      const bestByService = new Map<string, NormalizedProviderQuote>();
      for (const option of state.options) {
        const key = `${option.carrierCode}:${option.serviceCode}`;
        const current = bestByService.get(key);
        if (!current || option.basePriceRials < current.basePriceRials) bestByService.set(key, option);
      }
      return [...bestByService.values()];
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new ShippingProviderError("TIMEOUT", "استعلام هزینه ارسال در زمان مقرر کامل نشد.", true);
}

export function normalizeAmadastLocationPayload(payload: unknown, province?: ProviderLocation) {
  const parsed = cityEnvelopeSchema.safeParse(payload);
  if (!parsed.success || parsed.data.success === false || parsed.data.result === false) {
    throw new ShippingProviderError(
      "INVALID_RESPONSE",
      province ? "فهرست شهرهای آمادست معتبر نیست." : "فهرست استان‌های آمادست معتبر نیست.",
    );
  }
  const items = Array.isArray(parsed.data.data) ? parsed.data.data : [parsed.data.data];
  const meta = parsed.data.meta as { current_page?: number; last_page?: number } | undefined;
  const lastPage = Number(parsed.data.last_page ?? meta?.last_page ?? 1);
  const currentPage = Number(parsed.data.current_page ?? meta?.current_page ?? 1);
  if (!items.length || parsed.data.next_page_url
    || !Number.isSafeInteger(lastPage) || !Number.isSafeInteger(currentPage)
    || currentPage !== 1 || lastPage !== 1
    || new Set(items.map((item) => item.id)).size !== items.length
    || items.some((item) => !item.title.trim()
      || (province ? item.parent != null && item.parent !== province.externalId : item.parent != null && item.parent !== 0))) {
    throw new ShippingProviderError("INVALID_RESPONSE", "فهرست مکان‌های آمادست ناقص یا نامعتبر است.");
  }
  return items.map((item): ProviderLocation => ({
    externalId: item.id,
    name: item.title,
    // Provinces have no parent. Internally we use 0 as their root marker.
    // For a city response, fall back to the requested province if the provider
    // returns a null parent value.
    externalParentId: item.parent ?? province?.externalId ?? 0,
  }));
}

async function listLocations(timeoutMs: number): Promise<ProviderLocationTree> {
  const deadlineAt = Date.now() + LOCATION_SYNC_DEADLINE_MS;
  const requestTimeoutMs = Math.min(Math.max(1, timeoutMs), LOCATION_REQUEST_TIMEOUT_MS);
  const controller = new AbortController();
  const deadlineTimer = setTimeout(() => controller.abort(), LOCATION_SYNC_DEADLINE_MS);
  try {
    // Authenticate once; all location calls share a total deadline and headers.
    const headers = await authenticatedHeaders(requestTimeoutMs);
    const fetchLocations = (path: string) => requestJson(
      path,
      { method: "GET", headers, signal: controller.signal },
      requestTimeoutMs,
      true,
      deadlineAt,
    );
    const provinces = normalizeAmadastLocationPayload(await fetchLocations("/v1/cities"));
    if (provinces.length > 100) {
      throw new ShippingProviderError("INVALID_RESPONSE", "تعداد استان‌های دریافتی نامعتبر است.");
    }
    const cityLists: ProviderLocation[][] = new Array(provinces.length);
    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < provinces.length) {
        controller.signal.throwIfAborted();
        const index = nextIndex++;
        const province = provinces[index]!;
        cityLists[index] = normalizeAmadastLocationPayload(
          await fetchLocations(`/v1/cities?province_id=${province.externalId}`),
          province,
        );
      }
    };
    await Promise.all(Array.from({ length: Math.min(LOCATION_REQUEST_CONCURRENCY, provinces.length) }, worker));
    return { provinces, cities: cityLists.flat() };
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ShippingProviderError("TIMEOUT", "زمان همگام‌سازی شهرهای آمادست به پایان رسید؛ دوباره تلاش کنید.", true);
    }
    throw error;
  } finally {
    clearTimeout(deadlineTimer);
    controller.abort();
  }
}

async function createShipment(request: ProviderShipmentRequest, timeoutMs: number): Promise<ProviderShipmentResult> {
  // Resolve authentication before entering the ambiguous create-request window.
  // If this step fails, no order POST has been sent and the operation is safe to retry.
  const headers = await authenticatedHeaders(timeoutMs, true);
  let payload: unknown;
  try {
    payload = await requestJson(
      "/v1/orders",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          store_id: request.storeId,
          external_order_id: request.externalOrderNumber,
          recipient_name: request.recipientName,
          sender_name: request.senderName,
          recipient_mobile: request.recipientMobile,
          sender_mobile: request.senderMobile,
          recipient_city_id: request.recipientExternalCityId,
          recipient_address: request.recipientAddress,
          weight: request.weightGrams,
          value: Math.max(10_000, request.declaredValueRials),
          product_type: request.productType,
          package_type: request.packageType,
          recipient_postal_code: request.recipientPostalCode,
          description: request.description ?? undefined,
          is_breakable: false,
          is_liquid: request.isLiquid,
          is_big: false,
        }),
      },
      timeoutMs,
      false,
    );
  } catch (error) {
    throw classifyAmadastCreateDispatchError(error);
  }
  return normalizeAmadastCreateOrderPayload(payload);
}

export function normalizeAmadastCreateOrderPayload(payload: unknown): ProviderShipmentResult {
  const envelope = responseEnvelopeSchema.safeParse(payload);
  if (envelope.success && (envelope.data.success === false || envelope.data.result === false)) {
    throw new ShippingProviderError(
      "CREATE_REJECTED",
      providerMessage(payload) ?? "ثبت سفارش از سوی آمادست رد شد.",
      true,
    );
  }
  const parsed = createOrderEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    // This is a 2xx response to an already-dispatched POST, so malformed data
    // cannot safely be treated as a failed create operation.
    throw new ShippingProviderError(
      "CREATE_OUTCOME_UNKNOWN",
      "پاسخ ثبت سفارش آمادست قابل اعتبارسنجی نیست.",
      false,
      undefined,
      true,
    );
  }
  const id = parsed.data.data.id;
  const externalShipmentId = typeof id === "string" || typeof id === "number" ? String(id) : null;
  return { externalShipmentId, externalStatus: "SUBMITTED" };
}

async function lookupTracking(phone: string, timeoutMs: number): Promise<ProviderTrackingResult[]> {
  const query = new URLSearchParams();
  query.append("phone_number", phone);
  query.set("page", "1");
  query.set("per_page", "100");
  const payload = await requestJson(
    `/v1/orders/search?${query}`,
    { method: "GET", headers: await authenticatedHeaders(timeoutMs) },
    timeoutMs,
    true,
  );
  const parsed = trackingEnvelopeSchema.safeParse(payload);
  if (!parsed.success) throw new ShippingProviderError("INVALID_RESPONSE", "پاسخ رهگیری آمادست معتبر نیست.");
  return (parsed.data.data ?? []).map((item) => ({
    externalOrderNumber: item.external_order_id,
    carrierLabel: item.courier_title,
    amadastTrackingCode: item.amadast_tracking_code,
    carrierTrackingCode: item.courier_tracking_code ?? null,
  }));
}

export const amadastProvider: ShippingProvider = {
  key: "amadast",
  capabilities: {
    quotes: true,
    locationSync: true,
    createShipment: true,
    trackingLookup: true,
    cancelShipment: false,
    label: false,
  },
  quote,
  listLocations,
  createShipment,
  lookupTracking,
};

/** Matches the package-size IDs used by the official Amadast integration. */
export function resolveAmadastPackageType(dimensions: { lengthCm: number; widthCm: number; heightCm: number }) {
  const maxMillimetres = Math.max(dimensions.lengthCm, dimensions.widthCm, dimensions.heightCm) * 10;
  if (maxMillimetres <= 150) return 1;
  if (maxMillimetres <= 200) return 2;
  if (maxMillimetres <= 250) return 3;
  if (maxMillimetres <= 300) return 4;
  if (maxMillimetres <= 350) return 5;
  if (maxMillimetres <= 450) return 6;
  if (maxMillimetres <= 500) return 7;
  if (maxMillimetres <= 600) return 8;
  if (maxMillimetres <= 700) return 9;
  if (maxMillimetres <= 800) return 10;
  return 11;
}
