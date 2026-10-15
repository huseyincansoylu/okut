import "server-only";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { shops } from "@/db/schema";

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };

export function slugify(input: string) {
  return input
    .replace(/[çğıİöşü]/gi, (ch) => TR_MAP[ch] ?? TR_MAP[ch.toLowerCase()] ?? ch)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Creates a shop with a unique slug derived from its name. */
export async function createShop(ownerId: string, name: string) {
  const base = slugify(name) || "shop";

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const [shop] = await db
      .insert(shops)
      .values({ ownerId, name, slug })
      .onConflictDoNothing({ target: shops.slug })
      .returning();
    if (shop) return shop;
  }
  throw new Error("Could not generate a unique shop slug");
}

/** The signed-in owner's shop, or null if they haven't created one yet. Deduped per request. */
export const getOwnedShop = cache(async (ownerId: string) => {
  const [shop] = await db.select().from(shops).where(eq(shops.ownerId, ownerId)).limit(1);
  return shop ?? null;
});
