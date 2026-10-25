import prisma from "../prisma";
import { LOCAL_IMAGE_PLACEHOLDERS, safeImageSrc } from "../local-assets";
import { withStorefrontDataFallback } from "./storefront-fallback";

export async function getActiveBanners(position?: string) {
  return withStorefrontDataFallback("getActiveBanners", [], async () => {
    const banners = await prisma.marketingBanner.findMany({
      where: {
        isActive: true,
        ...(position ? { position } : {}),
      },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });

    return banners.map((banner) => ({
      ...banner,
      imageUrl: safeImageSrc(banner.imageUrl, LOCAL_IMAGE_PLACEHOLDERS.banner),
    }));
  });
}

export async function getGalleryImages(limit = 6) {
  return withStorefrontDataFallback("getGalleryImages", [], async () => {
    const images = await prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      take: limit,
    });

    return images.map((image) => ({
      ...image,
      imageUrl: safeImageSrc(image.imageUrl, LOCAL_IMAGE_PLACEHOLDERS.gallery) ?? LOCAL_IMAGE_PLACEHOLDERS.gallery,
    }));
  });
}
