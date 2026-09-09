import type { MetadataRoute } from "next";

const SITE_URL = "https://www.oilbar.ir";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/api",
        "/cart",
        "/checkout",
        "/products/compare",
        "/sign-in",
        "/sign-up",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
