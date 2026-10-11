"use server";

import { eq } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { shops } from "@/db/schema";
import type { Dictionary } from "@/i18n/dictionary";
import { getRequestDictionary } from "@/i18n/request";
import { requireUserId } from "@/lib/auth";
import { menuTag } from "@/lib/menu";
import { isMenuTheme } from "@/lib/menu-themes";
import { createShop, getOwnedShop } from "@/lib/shops";
import { removeMenuImages, uploadMenuImage, validateImage } from "@/lib/storage";

export type ShopFormState = { error?: string; ok?: boolean } | undefined;

function shopName(dict: Dictionary) {
  return z.string().trim().min(2, dict.errors.shopNameLength).max(60, dict.errors.shopNameMax);
}

// Fallback for accounts whose shop was not created during sign-up.
export async function createMyShop(_prev: ShopFormState, formData: FormData): Promise<ShopFormState> {
  const userId = await requireUserId();
  const dict = await getRequestDictionary();
  const parsed = shopName(dict).safeParse(formData.get("shopName"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [existing] = await db.select({ id: shops.id }).from(shops).where(eq(shops.ownerId, userId)).limit(1);
  if (existing) return { error: dict.errors.alreadyHasShop };

  await createShop(userId, parsed.data);
  refresh();
}

function settingsSchema(dict: Dictionary) {
  return z.object({
    name: shopName(dict),
    theme: z.string().refine(isMenuTheme, dict.errors.invalidTheme),
  });
}

export async function updateShopSettings(_prev: ShopFormState, formData: FormData): Promise<ShopFormState> {
  const shop = await getOwnedShop(await requireUserId());
  const dict = await getRequestDictionary();
  if (!shop) return { error: dict.errors.shopNotFound };

  const parsed = settingsSchema(dict).safeParse({ name: formData.get("name"), theme: formData.get("theme") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const image = formData.get("image");
  const file = image instanceof File && image.size > 0 ? image : null;
  if (file) {
    const invalid = validateImage(file);
    if (invalid) return { error: dict.errors[invalid] };
  }

  // The slug stays the same so printed QR codes keep working after a rename.
  let logoUrl = shop.logoUrl;
  if (file) {
    try {
      logoUrl = await uploadMenuImage(shop.id, file);
    } catch (error) {
      console.error("[storage]", error);
      return { error: dict.errors.imageUpload };
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
