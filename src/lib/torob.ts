import { createPublicKey, verify as verifySignature, type KeyObject } from "node:crypto";

import { resolveProductPricing, type ProductPromotionLike } from "@/lib/pricing";

export const TOROB_API_VERSION = "torob_api_v3";
export const TOROB_PAGE_SIZE = 100;
export const TOROB_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAt6Mu4T0pBORY11W+QeM35UsmLO3vsf+6yKpFDEImFk0=
-----END PUBLIC KEY-----`;

export type TorobProductRequest =
  | { type: "urls"; values: string[] }
  | { type: "uniques"; values: string[] }
  | { type: "page"; page: number; sort: "date_added_desc" | "date_updated_desc" };

export class TorobRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TorobRequestError";
  }
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.length > 0);
}

export function parseTorobProductRequest(value: unknown): TorobProductRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TorobRequestError("request body must be a JSON object");
  }

  const input = value as Record<string, unknown>;
  if ("page_urls" in input) {
    if (!isNonEmptyStringArray(input.page_urls)) throw new TorobRequestError("page_urls must be a non-empty list of strings");
    return { type: "urls", values: input.page_urls };
  }
  if ("page_uniques" in input) {
    if (!isNonEmptyStringArray(input.page_uniques)) throw new TorobRequestError("page_uniques must be a non-empty list of strings");
    return { type: "uniques", values: input.page_uniques };
  }

  if (!("page" in input)) throw new TorobRequestError("page parameter is not provided");
  if (!Number.isInteger(input.page) || Number(input.page) < 1) throw new TorobRequestError("page must be an integer starting from 1");
  if (!("sort" in input)) throw new TorobRequestError("sort parameter is not provided");
  if (input.sort !== "date_added_desc" && input.sort !== "date_updated_desc") {
    throw new TorobRequestError("sort must be date_added_desc or date_updated_desc");
  }

  return { type: "page", page: Number(input.page), sort: input.sort };
}

function decodeJsonPart(part: string) {
  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    throw new Error("توکن ترب ساختار معتبری ندارد.");
  }
}

export function verifyTorobJwt(
  token: string,
  audience: string,
  options: { now?: Date; publicKey?: string | KeyObject } = {},
) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("توکن ترب ساختار معتبری ندارد.");

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJsonPart(encodedHeader);
  const payload = decodeJsonPart(encodedPayload);

  if (header.alg !== "EdDSA" || header.v !== 1) {
    throw new Error("نسخه یا الگوریتم توکن ترب معتبر نیست.");
  }

  const publicKey = typeof options.publicKey === "string" || !options.publicKey
    ? createPublicKey(options.publicKey ?? TOROB_PUBLIC_KEY)
    : options.publicKey;
  const signingInput = Buffer.from(`${encodedHeader}.${encodedPayload}`);
  const signature = Buffer.from(encodedSignature, "base64url");
  if (!verifySignature(null, signingInput, publicKey, signature)) {
    throw new Error("امضای توکن ترب معتبر نیست.");
  }

  if (payload.aud !== audience) throw new Error("دامنه توکن ترب با دامنه درخواست مطابقت ندارد.");
  if (typeof payload.exp !== "number" || typeof payload.nbf !== "number") {
    throw new Error("زمان اعتبار توکن ترب ناقص است.");
  }

  const nowSeconds = Math.floor((options.now ?? new Date()).getTime() / 1000);
  if (nowSeconds > payload.exp) throw new Error("توکن ترب منقضی شده است.");
  if (nowSeconds < payload.nbf) throw new Error("توکن ترب هنوز معتبر نشده است.");

  return payload;
}

export function rialToTorobToman(value: number) {
  return Math.max(0, Math.round(value / 10));
}

export function absoluteStorefrontUrl(value: string, baseUrl: string) {
  try {
    return new URL(value, `${baseUrl.replace(/\/$/, "")}/`).toString();
  } catch {
    return value;
  }
}

export function toTehranIsoString(value: Date) {
  const tehranTimestamp = value.getTime() + 3.5 * 60 * 60 * 1000;
  return `${new Date(tehranTimestamp).toISOString().slice(0, -1)}+03:30`;
}

type TorobSourceProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string | { toString(): string };
  stock: number;
  imageUrl?: string | null;
  viscosity?: string | null;
  oilType?: string | null;
  approvals?: string | null;
  originCountry?: string | null;
  packagingSizeLit?: number | string | { toString(): string } | null;
  warranty?: string | null;
  technicalSpecs?: unknown;
  createdAt: Date;
  updatedAt: Date;
  brand: { name: string };
  category: { name: string };
  promotion?: ProductPromotionLike;
};

function buildSpecification(product: TorobSourceProduct) {
  const spec: Record<string, string | number> = {
    برند: product.brand.name,
  };
  if (product.viscosity) spec["گرانروی"] = product.viscosity;
  if (product.oilType) spec["نوع روغن"] = product.oilType;
  if (product.approvals) spec["استانداردها"] = product.approvals;
  if (product.originCountry) spec["کشور سازنده"] = product.originCountry;
  if (product.packagingSizeLit != null) spec["حجم بسته‌بندی (لیتر)"] = Number(product.packagingSizeLit);

  if (product.technicalSpecs && typeof product.technicalSpecs === "object" && !Array.isArray(product.technicalSpecs)) {
    for (const [key, value] of Object.entries(product.technicalSpecs as Record<string, unknown>)) {
      if ((typeof value === "string" || typeof value === "number") && key.length <= 100) spec[key] = value;
    }
  }
  return spec;
}

export function buildTorobProduct(product: TorobSourceProduct, baseUrl: string, now = new Date()) {
  const pricing = resolveProductPricing(product, now);
  const pageUrl = absoluteStorefrontUrl(`/products/${encodeURIComponent(product.slug)}`, baseUrl);
  const imageLinks = product.imageUrl ? [absoluteStorefrontUrl(product.imageUrl, baseUrl)] : [];

  return {
    page_unique: product.id,
    page_url: pageUrl,
    title: product.name.slice(0, 500),
    subtitle: [product.brand.name, product.viscosity, product.oilType].filter(Boolean).join("، ").slice(0, 500) || undefined,
    current_price: rialToTorobToman(pricing.effectivePrice),
    ...(pricing.hasDiscount ? { old_price: rialToTorobToman(pricing.basePrice) } : {}),
    availability: product.stock > 0 && pricing.effectivePrice > 0,
    category_name: product.category.name.slice(0, 200),
    image_links: imageLinks,
    spec: buildSpecification(product),
    guarantee: (product.warranty || "ضمانت اصالت کالا").slice(0, 200),
    ...(product.description ? { short_desc: product.description.replace(/\s+/g, " ").trim().slice(0, 500) } : {}),
    date_added: toTehranIsoString(product.createdAt),
    date_updated: toTehranIsoString(product.updatedAt),
  };
}

export function buildTorobResponse<T>(products: T[], total: number, currentPage: number) {
  return {
    api_version: TOROB_API_VERSION,
    current_page: currentPage,
    total,
    max_pages: Math.max(1, Math.ceil(total / TOROB_PAGE_SIZE)),
    products,
  };
}
