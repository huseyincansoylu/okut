/**
 * Creates (or refreshes) the read-only demo menus, one per language (see
 * src/lib/demo.ts): /menu/okut-cafe (Turkish), /menu/okut-cafe-london (English)
 * and /menu/okut-cafe-madrid (Spanish).
 *
 *   pnpm db:seed
 *
 * The shops have no owner, so no account can sign in and edit them. Re-running
 * replaces their categories and products but keeps the shop ids (and URLs).
 * Photos in scripts/demo-images/<language>/ (see CREDITS.md there) are uploaded
 * to the menu-images bucket under each shop's folder, overwriting earlier copies.
 * A refreshed menu is cached; restart the server / redeploy to see changes.
 */
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, products, shops } from "../src/db/schema.ts";
import type { Locale } from "../src/i18n/config.ts";
import { DEMO_SHOPS } from "../src/lib/demo.ts";
import type { DemoMenu } from "./demo-menus/types.mts";

const MENUS: Partial<Record<Locale, () => Promise<{ menu: DemoMenu }>>> = {
  tr: () => import("./demo-menus/tr.mts"),
  en: () => import("./demo-menus/en.mts"),
  es: () => import("./demo-menus/es.mts"),
};

const bucket = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
}).storage.from("menu-images");

/** Uploads a menu's photos and returns file name → public URL. */
async function uploadImages(shopId: string, locale: Locale, menu: DemoMenu) {
  const files = new Set(menu.flatMap((section) => section.items.flatMap((item) => (item.image ? [item.image] : []))));
  const urls = new Map<string, string>();
  for (const file of files) {
    const path = `${shopId}/demo/${file}`;
    const body = await readFile(new URL(`./demo-images/${locale}/${file}`, import.meta.url));
    const { error } = await bucket.upload(path, body, { contentType: "image/webp", upsert: true });
    if (error) throw new Error(`Uploading ${locale}/${file} failed: ${error.message}`);
    urls.set(file, bucket.getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

const client = postgres(process.env.DIRECT_URL ?? process.env.DATABASE_URL!, { prepare: false, max: 1 });
const db = drizzle(client);

try {
  for (const [locale, load] of Object.entries(MENUS) as [Locale, () => Promise<{ menu: DemoMenu }>][]) {
    const { menu } = await load();
    const demo = DEMO_SHOPS[locale];

    await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(shops).where(eq(shops.slug, demo.slug));
      if (existing?.ownerId) {
        throw new Error(`/menu/${demo.slug} belongs to a real account; refusing to overwrite it.`);
      }

      const values = { ...demo, ownerId: null };
      const [shop] = existing
        ? await tx.update(shops).set(values).where(eq(shops.id, existing.id)).returning()
        : await tx.insert(shops).values(values).returning();
      const imageUrls = await uploadImages(shop.id, locale, menu);
      // Products are removed by ON DELETE CASCADE.
      await tx.delete(categories).where(eq(categories.shopId, shop.id));

      let productCount = 0;
      for (const [categoryIndex, section] of menu.entries()) {
        const [category] = await tx
          .insert(categories)
          .values({ shopId: shop.id, name: section.category, sortOrder: categoryIndex })
          .returning();

        await tx.insert(products).values(
          section.items.map((item, sortOrder) => ({
            categoryId: category.id,
            name: item.name,
            price: item.price,
            description: item.description ?? null,
            imageUrl: item.image ? imageUrls.get(item.image)! : null,
            isAvailable: !item.soldOut,
            sortOrder,
          })),
        );
        productCount += section.items.length;
      }

      console.log(
        `✓ ${locale}: "${shop.name}" ${menu.length} categories, ${productCount} items, ${imageUrls.size} photos → /menu/${shop.slug}`,
      );
    });
  }
} finally {
  await client.end();
}
