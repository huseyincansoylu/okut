import "server-only";
import { headers } from "next/headers";

/**
 * The site's public origin without reading the request, so static pages can use it.
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL (e.g. "okut.vercel.app") at build time.
 */
export function siteOrigin() {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return host ? `https://${host}` : "http://localhost:3000";
}

/** Absolute URL of a shop's public menu, based on the current request's host. */
export async function getMenuUrl(slug: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/menu/${slug}`;
}
