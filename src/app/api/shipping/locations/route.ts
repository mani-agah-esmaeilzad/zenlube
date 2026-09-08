import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { config } from "@/lib/config";
import { getShippingCities, getShippingProvinces } from "@/lib/shipping/locations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provinceCode = url.searchParams.get("provinceCode")?.trim();
  const settings = await prisma.shippingSettings.findUnique({
    where: { id: "default" },
    select: { providerKey: true },
  });
  const providerKey = config.SHIPPING_PROVIDER !== "disabled"
    ? config.SHIPPING_PROVIDER
    : settings?.providerKey ?? undefined;
  const data = provinceCode
    ? await getShippingCities(provinceCode, providerKey)
    : await getShippingProvinces(providerKey);
  return NextResponse.json({ success: true, data }, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
  });
}
