"use server";

import { eq } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { shops } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { menuTag } from "@/lib/menu";
import { isMenuTheme } from "@/lib/menu-themes";
import { createShop, getOwnedShop } from "@/lib/shops";
import { removeMenuImages, uploadMenuImage, validateImage } from "@/lib/storage";

export type ShopFormState = { error?: string; ok?: boolean } | undefined;

const shopName = z.string().trim().min(2, "Dükkan adı en az 2 karakter olmalı.").max(60);

// Fallback for accounts whose shop was not created during sign-up.
export async function createMyShop(_prev: ShopFormState, formData: FormData): Promise<ShopFormState> {
  const userId = await requireUserId();
  const parsed = shopName.safeParse(formData.get("shopName"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [existing] = await db.select({ id: shops.id }).from(shops).where(eq(shops.ownerId, userId)).limit(1);
  if (existing) return { error: "Zaten bir dükkanınız var." };

  await createShop(userId, parsed.data);
  refresh();
}

const settingsSchema = z.object({
  name: shopName,
  theme: z.string().refine(isMenuTheme, "Geçersiz menü rengi."),
});

export async function updateShopSettings(_prev: ShopFormState, formData: FormData): Promise<ShopFormState> {
  const shop = await getOwnedShop(await requireUserId());
  if (!shop) return { error: "Dükkan bulunamadı." };

  const parsed = settingsSchema.safeParse({ name: formData.get("name"), theme: formData.get("theme") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const image = formData.get("image");
  const file = image instanceof File && image.size > 0 ? image : null;
  if (file) {
    const error = validateImage(file);
    if (error) return { error: error.replace("Fotoğraf", "Logo") };
  }

  // The slug stays the same so printed QR codes keep working after a rename.
  let logoUrl = shop.logoUrl;
  if (file) {
    try {
      logoUrl = await uploadMenuImage(shop.id, file);
    } catch (error) {
      console.error("[storage]", error);
      return { error: "Logo yüklenemedi. Lütfen tekrar deneyin." };
    }
  } else if (formData.get("removeImage") === "true") {
    logoUrl = null;
  }

  try {
    await db
      .update(shops)
      .set({ ...parsed.data, logoUrl })
      .where(eq(shops.id, shop.id));
  } catch (error) {
    if (file) await removeMenuImages([logoUrl]);
    throw error;
  }

  if (logoUrl !== shop.logoUrl) await removeMenuImages([shop.logoUrl]);
  updateTag(menuTag(shop.id));
  refresh();
  return { ok: true };
}
