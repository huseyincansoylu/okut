/**
 * Seeds a demo account you can sign in with, plus a shop with a full menu.
 * Safe to re-run: the demo password is reset and the shop is recreated.
 *
 *   pnpm db:seed
 *
 * Credentials are public on purpose (portfolio demo). Override them with
 * DEMO_EMAIL / DEMO_PASSWORD in .env.local if you like.
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, products, shops } from "../src/db/schema.ts";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../src/lib/demo.ts";

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

/**
 * Creates (or resets) a confirmed email/password user directly in Supabase's
 * auth schema. Going through the Auth API would trigger email sending and
 * address validation, which a demo account doesn't need.
 */
async function upsertDemoUser(): Promise<string> {
  const [existing] = await client<{ id: string }[]>`select id from auth.users where email = ${DEMO_EMAIL}`;
  let userId: string;

  if (existing) {
    userId = existing.id;
    await client`
      update auth.users
      set encrypted_password = extensions.crypt(${DEMO_PASSWORD}, extensions.gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now()
      where id = ${userId}`;
  } else {
    const [user] = await client<{ id: string }[]>`
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change, email_change_token_new
      ) values (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
        ${DEMO_EMAIL}, extensions.crypt(${DEMO_PASSWORD}, extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{}', now(), now(),
        '', '', '', ''
      ) returning id`;
    userId = user.id;
  }

  const identityData = JSON.stringify({ sub: userId, email: DEMO_EMAIL, email_verified: true });
  await client`
    insert into auth.identities (user_id, provider_id, provider, identity_data, created_at, updated_at)
    select ${userId}, ${userId}, 'email', ${identityData}::jsonb, now(), now()
    where not exists (select 1 from auth.identities where user_id = ${userId} and provider = 'email')`;

  return userId;
}

const client = postgres(process.env.DIRECT_URL ?? process.env.DATABASE_URL!, { prepare: false, max: 1 });
const db = drizzle(client);

try {
  const ownerId = await upsertDemoUser();

  await db.transaction(async (tx) => {
    // Categories and products are removed by ON DELETE CASCADE.
    await tx.delete(shops).where(eq(shops.slug, DEMO_SHOP.slug));
    const [shop] = await tx.insert(shops).values({ ...DEMO_SHOP, ownerId }).returning();

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
          isAvailable,
          sortOrder,
        })),
      );
      productCount += items.length;
    }

    console.log(`✓ Demo hesabı: ${DEMO_EMAIL}`);
    console.log(`✓ "${shop.name}" oluşturuldu: ${Object.keys(MENU).length} kategori, ${productCount} ürün → /menu/${shop.slug}`);
  });
} finally {
  await client.end();
}
