import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPageInfo, getPaginationParams } from "@/lib/pagination";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = getPaginationParams(Object.fromEntries(searchParams), { defaultPageSize: 24, maxPageSize: 100 });
  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.category.count(),
  ]);
  return NextResponse.json({ categories, pageInfo: createPageInfo(page, pageSize, total) });
}
