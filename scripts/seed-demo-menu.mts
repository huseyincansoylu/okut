/**
 * Creates (or refreshes) the read-only demo menu at /menu/demo-kafe.
 *
 *   pnpm db:seed
 *
 * The shop has no owner, so no account can sign in and edit it. Re-running
 * replaces its categories and products but keeps the shop id (and its URL).
 * Photos in scripts/demo-images (see CREDITS.md there) are uploaded to the
 * menu-images bucket under the shop's folder, overwriting earlier copies.
 * The public menu is cached; restart the server / redeploy to see changes.
 */
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, products, shops } from "../src/db/schema.ts";

const DEMO_SHOP = { name: "Demo Kafe", slug: "demo-kafe" };

type Item = [name: string, price: string, description?: string, isAvailable?: boolean];

const MENU: Record<string, Item[]> = {
  Kahvaltı: [
    ["Serpme Kahvaltı (2 kişilik)", "650", "Peynir çeşitleri, zeytin, bal-kaymak, reçel, sucuklu yumurta, sınırsız çay"],
    ["Menemen", "180", "Domates, biber ve köy yumurtası; isteğe göre soğanlı"],
    ["Sucuklu Yumurta", "200", "Bakır sahanda kasap sucuk ve iki yumurta"],
    ["Simit Tabağı", "120", "Taze simit, beyaz peynir, domates, salatalık"],
  ],
  "Sıcak İçecekler": [
    ["Çay", "20", "İnce belli bardakta demlik çay"],
    ["Türk Kahvesi", "70", "Yanında lokum ile"],
    ["Espresso", "65"],
    ["Latte", "90", "Çift shot espresso ve buharla ısıtılmış süt"],
    ["Sahlep", "95", "Tarçınlı, kış aylarına özel", false],
  ],
  "Soğuk İçecekler": [
    ["Ev Yapımı Limonata", "85", "Taze sıkılmış limon ve nane"],
    ["Iced Latte", "100"],
    ["Ayran", "40"],
    ["Soda", "30"],
  ],
  Tatlılar: [
    ["San Sebastian Cheesecake", "160", "Çikolata sosu ile servis edilir"],
    ["Fıstıklı Baklava (4 dilim)", "220", "Antep fıstığı ile"],
    ["Brownie", "120", "Sıcak servis, yanında dondurma"],
    ["Sütlaç", "95", "Fırında, üzeri fındıklı"],
  ],
  Atıştırmalıklar: [
    ["Kaşarlı Tost", "110"],
    ["Patates Kızartması", "90", "Baharatlı, yanında ketçap ve mayonez"],
    ["Mevsim Salata", "130", "Akdeniz yeşillikleri, nar ekşili sos"],
  ],
};

/** Product name → photo file in scripts/demo-images. */
const IMAGES: Record<string, string> = {
  "Serpme Kahvaltı (2 kişilik)": "serpme-kahvalti.webp",
  Menemen: "menemen.webp",
  "Simit Tabağı": "simit-tabagi.webp",
  Çay: "cay.webp",
  "Türk Kahvesi": "turk-kahvesi.webp",
  Latte: "latte.webp",
  "Ev Yapımı Limonata": "limonata.webp",
  "Iced Latte": "iced-latte.webp",
  "San Sebastian Cheesecake": "cheesecake.webp",
  "Fıstıklı Baklava (4 dilim)": "baklava.webp",
  Brownie: "brownie.webp",
  "Patates Kızartması": "patates-kizartmasi.webp",
};

const bucket = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
}).storage.from("menu-images");

/** Uploads every demo photo and returns product name → public URL. */
async function uploadImages(shopId: string) {
  const urls = new Map<string, string>();
  for (const [productName, file] of Object.entries(IMAGES)) {
    const path = `${shopId}/demo/${file}`;
    const body = await readFile(new URL(`./demo-images/${file}`, import.meta.url));
    const { error } = await bucket.upload(path, body, { contentType: "image/webp", upsert: true });
    if (error) throw new Error(`Uploading ${file} failed: ${error.message}`);
    urls.set(productName, bucket.getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

const client = postgres(process.env.DIRECT_URL ?? process.env.DATABASE_URL!, { prepare: false, max: 1 });
const db = drizzle(client);

try {
  await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(shops).where(eq(shops.slug, DEMO_SHOP.slug));
    if (existing?.ownerId) {
      throw new Error(`/menu/${DEMO_SHOP.slug} belongs to a real account; refusing to overwrite it.`);
    }

    const shop = existing ?? (await tx.insert(shops).values({ ...DEMO_SHOP, ownerId: null }).returning())[0];
    const imageUrls = await uploadImages(shop.id);
    // Products are removed by ON DELETE CASCADE.
    await tx.delete(categories).where(eq(categories.shopId, shop.id));

    let productCount = 0;
    for (const [categoryIndex, [categoryName, items]] of Object.entries(MENU).entries()) {
      const [category] = await tx
        .insert(categories)
        .values({ shopId: shop.id, name: categoryName, sortOrder: categoryIndex })
        .returning();

      await tx.insert(products).values(
        items.map(([name, price, description, isAvailable = true], sortOrder) => ({
          categoryId: category.id,
          name,
          price,
          description: description ?? null,
          imageUrl: imageUrls.get(name) ?? null,
          isAvailable,
          sortOrder,
        })),
      );
      productCount += items.length;
    }

    console.log(`✓ "${shop.name}": ${Object.keys(MENU).length} kategori, ${productCount} ürün, ${imageUrls.size} fotoğraf → /menu/${shop.slug}`);
  });
} finally {
  await client.end();
}
