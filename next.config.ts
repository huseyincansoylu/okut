import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Turbopack's filesystem cache (on by default since 16.3) kept serving CSS from
    // before globals.css changed: Vercel restores .next/cache between builds and the
    // Tailwind loader's output wasn't invalidated. Off for builds and dev until that's fixed.
    turbopackFileSystemCacheForBuild: false,
    turbopackFileSystemCacheForDev: false,
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
