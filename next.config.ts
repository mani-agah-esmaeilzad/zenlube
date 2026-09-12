import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const privatePages = ["/admin/:path*", "/account/:path*", "/cart/:path*", "/checkout/:path*", "/sign-in", "/sign-up", "/products/compare"].map(source => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
    const feeds = ["/api/:path*", "/torob_api/:path*"].map(source => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
    }));
    return [...privatePages, ...feeds];
  },
  images: {
    // Serve catalog originals even when the hosted image-transform quota is exhausted.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "aidlube.ir",
      },
      {
        protocol: "https",
        hostname: "www.aidlube.ir",
      },
      {
        protocol: "https",
        hostname: "cdn-sth1.bama.ir",
      },
    ],
  },
};

export default nextConfig;
