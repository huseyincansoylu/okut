import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, products, shops } from "@/db/schema";

export const menuTag = (shopId: string) => `menu:${shopId}`;

/** Public menu for a shop slug. Cached until the owner edits the menu (see `updateTag(menuTag(...))`). */
export async function getPublicMenu(slug: string) {
  "use cache";
  cacheLife("max");

  const [shop] = await db
    .select({ id: shops.id, name: shops.name, slug: shops.slug, logoUrl: shops.logoUrl })
    .from(shops)
    .where(eq(shops.slug, slug))
    .limit(1);
  if (!shop) return null;
  cacheTag(menuTag(shop.id));

  const categoryRows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.shopId, shop.id))
    .orderBy(asc(categories.sortOrder), asc(categories.createdAt));

  const productRows = categoryRows.length
    ? await db
        .select({
          id: products.id,
          categoryId: products.categoryId,
          name: products.name,
          description: products.description,
          price: products.price,
          imageUrl: products.imageUrl,
          isAvailable: products.isAvailable,
        })
        .from(products)
        .where(inArray(products.categoryId, categoryRows.map((c) => c.id)))
        .orderBy(asc(products.sortOrder), asc(products.createdAt))
    : [];

  const sections = categoryRows
    .map((category) => ({ ...category, products: productRows.filter((p) => p.categoryId === category.id) }))
    .filter((section) => section.products.length > 0);

  return { shop, sections };
}

export type PublicMenu = NonNullable<Awaited<ReturnType<typeof getPublicMenu>>>;
