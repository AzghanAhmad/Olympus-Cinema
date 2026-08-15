import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Avoid remote optimizer delays (Unsplash DNS fails offline); serve local assets directly
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
