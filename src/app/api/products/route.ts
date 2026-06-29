import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { createPageInfo, getPaginationParams } from "@/lib/pagination";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const categoryId = searchParams.get("category") ?? undefined;
  const brandId = searchParams.get("brand") ?? undefined;
  const carSlug = searchParams.get("car") ?? undefined;
  const { page, pageSize, skip } = getPaginationParams(Object.fromEntries(searchParams), { defaultPageSize: 24, maxPageSize: 100 });

  const where: Prisma.ProductWhereInput = {
    NOT: { slug: { startsWith: "deleted-" } },
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { viscosity: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(carSlug
      ? {
          carMappings: {
            some: {
              car: { slug: carSlug },
            },
          },
        }
      : {}),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        carMappings: {
          include: {
            car: true,
          },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products: products.map((product) => ({
      ...product,
      carMappings: product.carMappings.map(({ car, ...rest }) => ({
        ...rest,
        car,
      })),
    })),
    pageInfo: createPageInfo(page, pageSize, total),
  });
}
