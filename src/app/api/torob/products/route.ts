import { NextResponse } from "next/server";

import { queryTorobProducts } from "@/lib/torob-catalog";
import {
  buildTorobProduct,
  buildTorobResponse,
  parseTorobProductRequest,
  TorobRequestError,
  type TorobProductRequest,
  verifyTorobJwt,
} from "@/lib/torob";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function baseUrlFromRequest(request: Request) {
  return new URL(request.url).origin.replace(/\/$/, "");
}

async function createResponse(request: Request, input: TorobProductRequest) {
  const { products, total, currentPage } = await queryTorobProducts(input);
  const baseUrl = baseUrlFromRequest(request);
  const response = NextResponse.json(
    buildTorobResponse(products.map((product) => buildTorobProduct(product, baseUrl)), total, currentPage),
  );
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (!params.has("page") && !params.has("sort")) {
    return createResponse(request, { type: "page", page: 1, sort: "date_added_desc" });
  }

  try {
    const input = parseTorobProductRequest({
      ...(params.has("page") ? { page: Number(params.get("page")) } : {}),
      ...(params.has("sort") ? { sort: params.get("sort") } : {}),
    });
    return await createResponse(request, input);
  } catch (error) {
    if (!(error instanceof TorobRequestError)) throw error;
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
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
