import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { createPageInfo, getPaginationParams } from "@/lib/pagination";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const categoryParam = searchParams.get("category") ?? undefined;
  const brandParam = searchParams.get("brand") ?? undefined;
  const carSlug = searchParams.get("car") ?? undefined;
  const minPrice = Number(searchParams.get("minPrice") ?? "") || undefined;
  const maxPrice = Number(searchParams.get("maxPrice") ?? "") || undefined;
  const minRating = Number(searchParams.get("minRating") ?? "") || undefined;
  const inStock = searchParams.get("inStock") === "1";
  const { page, pageSize, skip } = getPaginationParams(Object.fromEntries(searchParams), { defaultPageSize: 24, maxPageSize: 100 });

  const filters: Prisma.ProductWhereInput[] = [{ NOT: { slug: { startsWith: "deleted-" } } }];

  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { viscosity: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
    });
  }

  if (categoryParam) {
    filters.push({
      OR: [{ categoryId: categoryParam }, { category: { slug: categoryParam } }],
    });
  }

  if (brandParam) {
    filters.push({
      OR: [{ brandId: brandParam }, { brand: { slug: brandParam } }],
    });
  }

  if (carSlug) {
    filters.push({
      carMappings: {
        some: {
          car: { slug: carSlug },
        },
      },
    });
  }

  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    filters.push({
      price: {
        ...(typeof minPrice === "number" ? { gte: minPrice } : {}),
        ...(typeof maxPrice === "number" ? { lte: maxPrice } : {}),
      },
    });
  }

  if (typeof minRating === "number") {
    filters.push({ averageRating: { gte: minRating } });
  }

  if (inStock) {
    filters.push({ stock: { gt: 0 } });
  }

  const where: Prisma.ProductWhereInput = { AND: filters };

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
