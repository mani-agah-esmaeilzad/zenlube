import prisma from "../prisma";

export async function getBrandsWithProductCount() {
  return prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}
