import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;

  const cars = await prisma.car.findMany({
    where: search
      ? {
          OR: [
            { manufacturer: { contains: search, mode: "insensitive" } },
            { model: { contains: search, mode: "insensitive" } },
            { generation: { contains: search, mode: "insensitive" } },
            { engineCode: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
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
  });

  return NextResponse.json({
    cars: cars.map((car) => ({
      ...car,
      productMappings: car.productMappings.map(({ product, ...rest }) => ({
        ...rest,
        product,
      })),
    })),
  });
}
