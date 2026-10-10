import "server-only";
import { headers } from "next/headers";

/** Absolute URL of a shop's public menu, based on the current request's host. */
export async function getMenuUrl(slug: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/menu/${slug}`;
}
