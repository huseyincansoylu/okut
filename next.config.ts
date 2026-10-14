import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
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
  // Keep earlier addresses working.
  async redirects() {
    return [
      // URLs used to carry a language prefix (/tr/..., and /en/..., /es/... before that).
      { source: "/:lang(tr|en|es)", destination: "/", permanent: true },
      { source: "/:lang(tr|en|es)/:path*", destination: "/:path*", permanent: true },
      // Earlier demo cafés.
      { source: "/menu/okut-cafe-:city(istanbul|london|madrid)", destination: "/menu/okut-cafe", permanent: false },
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
