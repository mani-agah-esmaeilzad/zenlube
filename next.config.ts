import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
