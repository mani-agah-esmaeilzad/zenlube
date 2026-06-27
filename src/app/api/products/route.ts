import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const categoryId = searchParams.get("category") ?? undefined;
  const brandId = searchParams.get("brand") ?? undefined;
  const carSlug = searchParams.get("car") ?? undefined;

  const products = await prisma.product.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { viscosity: { contains: search, mode: "insensitive" } },
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
    },
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
  });

  return NextResponse.json({
    products: products.map((product) => ({
      ...product,
      carMappings: product.carMappings.map(({ car, ...rest }) => ({
        ...rest,
        car,
      })),
    })),
  });
}
