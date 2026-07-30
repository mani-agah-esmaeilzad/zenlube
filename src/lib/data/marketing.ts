import prisma from "../prisma";
import { withStorefrontDataFallback } from "./storefront-fallback";

export async function getActiveBanners(position?: string) {
  return withStorefrontDataFallback("getActiveBanners", [], () =>
    prisma.marketingBanner.findMany({
      where: {
        isActive: true,
        ...(position ? { position } : {}),
      },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
  );
}

export async function getGalleryImages(limit = 6) {
  return withStorefrontDataFallback("getGalleryImages", [], () =>
    prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      take: limit,
    }),
  );
}
