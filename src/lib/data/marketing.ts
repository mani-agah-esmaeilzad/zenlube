import prisma from "../prisma";

export async function getActiveBanners(position?: string) {
  return prisma.marketingBanner.findMany({
    where: {
      isActive: true,
      ...(position ? { position } : {}),
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}

export async function getGalleryImages(limit = 6) {
  return prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: "asc" },
    take: limit,
  });
}
