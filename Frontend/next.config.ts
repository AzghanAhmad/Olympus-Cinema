import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Turbopack FS cache was panicking/restoring on this disk and wedging /account compiles
    turbopackFileSystemCacheForDev: false,
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    // Avoid remote optimizer delays (Unsplash DNS fails offline); serve local assets directly
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
