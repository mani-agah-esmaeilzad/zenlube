import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPageInfo, getPaginationParams } from "@/lib/pagination";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = getPaginationParams(Object.fromEntries(searchParams), { defaultPageSize: 24, maxPageSize: 100 });
  const [brands, total] = await prisma.$transaction([
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.brand.count(),
  ]);
  return NextResponse.json({ brands, pageInfo: createPageInfo(page, pageSize, total) });
}
