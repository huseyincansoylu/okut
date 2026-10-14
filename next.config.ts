import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Photos are resized to WebP in the browser (~100–400 KB); leave headroom.
      bodySizeLimit: "3mb",
    },
  },
  // The Turkish demo moved to /menu/okut-cafe-istanbul; keep links shared before that working.
  async redirects() {
    return [
      { source: "/menu/okut-cafe", destination: "/menu/okut-cafe-istanbul", permanent: false },
      { source: "/:lang/menu/okut-cafe", destination: "/:lang/menu/okut-cafe-istanbul", permanent: false },
    ];
  },
  images: {
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/menu-images/**`)] : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
