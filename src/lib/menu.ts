import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, products, shops, type Translations } from "@/db/schema";
import type { Locale } from "@/i18n/config";

export const menuTag = (shopId: string) => `menu:${shopId}`;

/** Public menu for a shop slug. Cached until the owner edits the menu (see `updateTag(menuTag(...))`). */
export async function getPublicMenu(slug: string) {
  "use cache";

  const [shop] = await db
    .select({ id: shops.id, name: shops.name, slug: shops.slug, logoUrl: shops.logoUrl, theme: shops.theme })
    .from(shops)
    .where(eq(shops.slug, slug))
    .limit(1);
  if (!shop) {
    // The shop may be created later (e.g. by the demo seed), so don't keep the miss for long.
    cacheLife("minutes");
    return null;
  }
  cacheLife("max");
  cacheTag(menuTag(shop.id));

  const categoryRows = await db
    .select({ id: categories.id, name: categories.name, translations: categories.translations })
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
          translations: products.translations,
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

type RawMenu = NonNullable<Awaited<ReturnType<typeof getPublicMenu>>>;

/** A row's text in `locale`, falling back to the original for missing translations. */
export function localized<T extends { name: string; description?: string | null; translations: Translations }>(
  row: T,
  locale: Locale,
) {
  const translation = row.translations[locale];
  return {
    name: translation?.name || row.name,
    description: translation?.description || row.description || null,
  };
}

/** The menu with every category and product name/description in `locale`. */
export function localizeMenu(menu: RawMenu, locale: Locale) {
  return {
    shop: menu.shop,
    sections: menu.sections.map(({ translations, ...section }) => ({
      ...section,
      name: localized({ ...section, translations }, locale).name,
      products: section.products.map(({ translations, ...product }) => ({
        ...product,
        ...localized({ ...product, translations }, locale),
      })),
    })),
  };
}

export type PublicMenu = ReturnType<typeof localizeMenu>;
