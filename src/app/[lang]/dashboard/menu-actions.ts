"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { categories, products, type Translations } from "@/db/schema";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { getRequestDictionary, getRequestLocale } from "@/i18n/request";
import { requireUserId } from "@/lib/auth";
import { menuTag } from "@/lib/menu";
import { parsePrice } from "@/lib/format";
import { getOwnedShop } from "@/lib/shops";
import { removeMenuImages, uploadMenuImage, validateImage } from "@/lib/storage";

export type ActionState = { error?: string; ok?: boolean } | undefined;

/** Optional English text; empty fields are dropped so menus fall back to the original. */
function englishTranslation(name: FormDataEntryValue | null, description?: FormDataEntryValue | null): Translations {
  const en = {
    name: typeof name === "string" ? name.trim().slice(0, 80) : "",
    description: typeof description === "string" ? description.trim().slice(0, 300) : "",
  };
  const entries = Object.entries(en).filter(([, value]) => value);
  return entries.length ? { en: Object.fromEntries(entries) } : {};
}

function categorySchema(dict: Dictionary) {
  return z.object({
    name: z.string().trim().min(1, dict.errors.categoryRequired).max(50, dict.errors.categoryMax),
  });
}

function productSchema(dict: Dictionary, locale: Locale) {
  return z.object({
    name: z.string().trim().min(1, dict.errors.productRequired).max(80, dict.errors.productMax),
    description: z
      .string()
      .trim()
      .max(300, dict.errors.descriptionMax)
      .transform((v) => v || null),
    // Typed in the visitor's format: "1.250,50" (tr) or "1,250.50" (en) → "1250.50"
    price: z
      .string()
      .trim()
      .min(1, dict.errors.priceRequired)
      .transform((v) => parsePrice(v, locale))
      .pipe(
        z
          .number({ error: dict.errors.priceInvalid })
          .min(0, dict.errors.priceNegative)
          .max(1_000_000, dict.errors.priceTooHigh),
      )
      .transform((n) => n.toFixed(2)),
    isAvailable: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
  });
}

async function requireShopId() {
  const shop = await getOwnedShop(await requireUserId());
  if (!shop) throw new Error("No shop for current user");
  return shop.id;
}

/** Category ids that belong to the shop; used to scope product writes. */
function shopCategoryIds(shopId: string) {
  return db.select({ id: categories.id }).from(categories).where(eq(categories.shopId, shopId));
}

/** Expires the public menu cache and refreshes the dashboard. */
function menuChanged(shopId: string) {
  updateTag(menuTag(shopId));
  refresh();
}

function firstIssue(error: z.ZodError) {
  return { error: error.issues[0].message };
}

// ---------- Categories ----------

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const shopId = await requireShopId();
  const dict = await getRequestDictionary();
  const parsed = categorySchema(dict).safeParse({ name: formData.get("name") });
  if (!parsed.success) return firstIssue(parsed.error);

  await db.insert(categories).values({
    shopId,
    name: parsed.data.name,
    translations: englishTranslation(formData.get("nameEn")),
    sortOrder: sql`(select coalesce(max(${categories.sortOrder}), -1) + 1 from ${categories} where ${categories.shopId} = ${shopId})`,
  });
  menuChanged(shopId);
  return { ok: true };
}

export async function updateCategory(
  categoryId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const shopId = await requireShopId();
  const dict = await getRequestDictionary();
  const parsed = categorySchema(dict).safeParse({ name: formData.get("name") });
  if (!parsed.success) return firstIssue(parsed.error);

  const updated = await db
    .update(categories)
    .set({ name: parsed.data.name, translations: englishTranslation(formData.get("nameEn")) })
    .where(and(eq(categories.id, categoryId), eq(categories.shopId, shopId)))
    .returning({ id: categories.id });
  if (updated.length === 0) return { error: dict.errors.categoryNotFound };

  menuChanged(shopId);
  return { ok: true };
}

export async function deleteCategory(categoryId: string): Promise<ActionState> {
  const shopId = await requireShopId();
  const images = await db
    .select({ imageUrl: products.imageUrl })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(categories.id, categoryId), eq(categories.shopId, shopId)));

  // Products are removed by the ON DELETE CASCADE foreign key.
  await db.delete(categories).where(and(eq(categories.id, categoryId), eq(categories.shopId, shopId)));
  await removeMenuImages(images.map((i) => i.imageUrl));
  menuChanged(shopId);
  return { ok: true };
}

// ---------- Products ----------

async function readProduct(formData: FormData) {
  const [dict, locale] = await Promise.all([getRequestDictionary(), getRequestLocale()]);
  const parsed = productSchema(dict, locale).safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    isAvailable: formData.get("isAvailable"),
  });
  const translations = englishTranslation(formData.get("nameEn"), formData.get("descriptionEn"));
  return { dict, parsed, translations };
}

/** The uploaded photo (if any) and whether the existing one should be removed. */
function readImage(formData: FormData, dict: Dictionary) {
  const image = formData.get("image");
  const file = image instanceof File && image.size > 0 ? image : null;
  const invalid = file ? validateImage(file) : null;
  return { file, remove: formData.get("removeImage") === "true", error: invalid && dict.errors[invalid] };
}

/** Uploads the photo, turning storage failures into a form error. */
async function tryUpload(shopId: string, file: File, dict: Dictionary): Promise<{ url: string } | { error: string }> {
  try {
    return { url: await uploadMenuImage(shopId, file) };
  } catch (error) {
    console.error("[storage]", error);
    return { error: dict.errors.imageUpload };
  }
}

/** Product row scoped to the shop, or undefined if it isn't the owner's. */
async function findOwnedProduct(productId: string, shopId: string) {
  const [product] = await db
    .select({ id: products.id, imageUrl: products.imageUrl })
    .from(products)
    .where(and(eq(products.id, productId), inArray(products.categoryId, shopCategoryIds(shopId))));
  return product;
}

export async function createProduct(
  categoryId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const shopId = await requireShopId();
  const { dict, parsed, translations } = await readProduct(formData);
  if (!parsed.success) return firstIssue(parsed.error);
  const image = readImage(formData, dict);
  if (image.error) return { error: image.error };

  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.shopId, shopId)));
  if (!category) return { error: dict.errors.categoryNotFound };

  let imageUrl: string | null = null;
  if (image.file) {
    const upload = await tryUpload(shopId, image.file, dict);
    if ("error" in upload) return upload;
    imageUrl = upload.url;
  }
  try {
    await db.insert(products).values({
      ...parsed.data,
      translations,
      imageUrl,
      categoryId,
      sortOrder: sql`(select coalesce(max(${products.sortOrder}), -1) + 1 from ${products} where ${products.categoryId} = ${categoryId})`,
    });
  } catch (error) {
    await removeMenuImages([imageUrl]);
    throw error;
  }

  menuChanged(shopId);
  return { ok: true };
}

export async function updateProduct(
  productId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const shopId = await requireShopId();
  const { dict, parsed, translations } = await readProduct(formData);
  if (!parsed.success) return firstIssue(parsed.error);
  const image = readImage(formData, dict);
  if (image.error) return { error: image.error };

  const existing = await findOwnedProduct(productId, shopId);
  if (!existing) return { error: dict.errors.productNotFound };

  let imageUrl = existing.imageUrl;
  if (image.file) {
    const upload = await tryUpload(shopId, image.file, dict);
    if ("error" in upload) return upload;
    imageUrl = upload.url;
  } else if (image.remove) {
    imageUrl = null;
  }

  try {
    await db
      .update(products)
      .set({ ...parsed.data, translations, imageUrl })
      .where(eq(products.id, existing.id));
  } catch (error) {
    if (image.file) await removeMenuImages([imageUrl]);
    throw error;
  }

  if (imageUrl !== existing.imageUrl) await removeMenuImages([existing.imageUrl]);
  menuChanged(shopId);
  return { ok: true };
}

export async function setProductAvailability(productId: string, isAvailable: boolean): Promise<ActionState> {
  const shopId = await requireShopId();
  await db
    .update(products)
    .set({ isAvailable })
    .where(and(eq(products.id, productId), inArray(products.categoryId, shopCategoryIds(shopId))));
  menuChanged(shopId);
  return { ok: true };
}

export async function deleteProduct(productId: string): Promise<ActionState> {
  const shopId = await requireShopId();
  const [deleted] = await db
    .delete(products)
    .where(and(eq(products.id, productId), inArray(products.categoryId, shopCategoryIds(shopId))))
    .returning({ imageUrl: products.imageUrl });
  await removeMenuImages([deleted?.imageUrl]);
  menuChanged(shopId);
  return { ok: true };
}
