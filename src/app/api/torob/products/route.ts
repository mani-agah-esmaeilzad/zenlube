import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { storefrontBuyableProductWhere } from "@/lib/storefront-visibility";
import {
  buildTorobProduct,
  buildTorobResponse,
  parseTorobProductRequest,
  TOROB_PAGE_SIZE,
  TorobRequestError,
  type TorobProductRequest,
  verifyTorobJwt,
} from "@/lib/torob";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  stock: true,
  imageUrl: true,
  viscosity: true,
  oilType: true,
  approvals: true,
  originCountry: true,
  packagingSizeLit: true,
  warranty: true,
  technicalSpecs: true,
  createdAt: true,
  updatedAt: true,
  brand: { select: { name: true } },
  category: { select: { name: true } },
  promotion: true,
} as const;

function baseUrlFromRequest(request: Request) {
  return new URL(request.url).origin.replace(/\/$/, "");
}

function productSlugFromUrl(value: string) {
  try {
    const segments = new URL(value).pathname.split("/").filter(Boolean);
    const productIndex = segments.lastIndexOf("products");
    return productIndex >= 0 && segments[productIndex + 1] ? decodeURIComponent(segments[productIndex + 1]) : null;
  } catch {
    return null;
  }
}

async function queryProducts(input: TorobProductRequest) {
  const baseWhere = storefrontBuyableProductWhere({ imageUrl: { not: null } });

  if (input.type === "page") {
    const skip = (input.page - 1) * TOROB_PAGE_SIZE;
    const orderBy = input.sort === "date_updated_desc" ? { updatedAt: "desc" as const } : { createdAt: "desc" as const };
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({ where: baseWhere, select: productSelect, orderBy, skip, take: TOROB_PAGE_SIZE }),
      prisma.product.count({ where: baseWhere }),
    ]);
    return { products, total, currentPage: input.page };
  }

  const requestedValues = input.values.slice(0, TOROB_PAGE_SIZE);
  const identifiers = input.type === "uniques"
    ? requestedValues
    : requestedValues.map(productSlugFromUrl).filter((value): value is string => Boolean(value));
  const products = await prisma.product.findMany({
    where: storefrontBuyableProductWhere({
      imageUrl: { not: null },
      ...(input.type === "uniques" ? { id: { in: identifiers } } : { slug: { in: identifiers } }),
    }),
    select: productSelect,
  });
  const indexOf = (product: (typeof products)[number]) => identifiers.indexOf(input.type === "uniques" ? product.id : product.slug);
  products.sort((left, right) => indexOf(left) - indexOf(right));
  return { products, total: products.length, currentPage: 1 };
}

async function createResponse(request: Request, input: TorobProductRequest) {
  const { products, total, currentPage } = await queryProducts(input);
  const baseUrl = baseUrlFromRequest(request);
  const response = NextResponse.json(
    buildTorobResponse(products.map((product) => buildTorobProduct(product, baseUrl)), total, currentPage),
  );
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function GET(request: Request) {
  return createResponse(request, { type: "page", page: 1, sort: "date_added_desc" });
}

export async function POST(request: Request) {
  const token = request.headers.get("x-torob-token");
  const tokenVersion = request.headers.get("x-torob-token-version");
  const audience = request.headers.get("host") ?? new URL(request.url).host;

  if (!token || tokenVersion !== "1") {
    return NextResponse.json({ error: "missing or invalid Torob authentication headers" }, { status: 401 });
  }

  try {
    verifyTorobJwt(token, audience);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "invalid Torob token" }, { status: 401 });
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "content-type must be application/json" }, { status: 400 });
  }

  try {
    const body = await request.json();
    return await createResponse(request, parseTorobProductRequest(body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid request";
    return NextResponse.json({ error: message }, { status: error instanceof TorobRequestError || error instanceof SyntaxError ? 400 : 500 });
  }
}
