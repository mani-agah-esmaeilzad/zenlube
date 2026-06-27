import prisma from "../prisma";

export async function getBrandsWithProductCount() {
  return prisma.brand.findMany({
    include: {
      _count: {
        select: {
          products: {
            where: { NOT: { slug: { startsWith: "deleted-" } } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}
