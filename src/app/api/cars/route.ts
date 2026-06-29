import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPageInfo, getPaginationParams } from "@/lib/pagination";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const { page, pageSize, skip } = getPaginationParams(Object.fromEntries(searchParams), { defaultPageSize: 24, maxPageSize: 100 });
  const where = search
    ? {
        OR: [
          { manufacturer: { contains: search, mode: "insensitive" as const } },
          { model: { contains: search, mode: "insensitive" as const } },
          { generation: { contains: search, mode: "insensitive" as const } },
          { engineCode: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [cars, total] = await prisma.$transaction([
    prisma.car.findMany({
      where,
      include: {
        productMappings: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
      orderBy: [
        { manufacturer: "asc" },
        { model: "asc" },
        { generation: "asc" },
      ],
      skip,
      take: pageSize,
    }),
    prisma.car.count({ where }),
  ]);

  return NextResponse.json({
    cars: cars.map((car) => ({
      ...car,
      productMappings: car.productMappings.map(({ product, ...rest }) => ({
        ...rest,
        product,
      })),
    })),
    pageInfo: createPageInfo(page, pageSize, total),
  });
}
