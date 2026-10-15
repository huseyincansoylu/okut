"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { dict } from "@/lib/dictionary";
import { menuTag } from "@/lib/menu";
import { parsePrice } from "@/lib/format";
import { getOwnedShop } from "@/lib/shops";
import { removeMenuImages, uploadMenuImage, validateImage } from "@/lib/storage";

export type ActionState = { error?: string; ok?: boolean } | undefined;

const categorySchema = z.object({
  name: z.string().trim().min(1, dict.errors.categoryRequired).max(50, dict.errors.categoryMax),
});

const productSchema = z.object({
  name: z.string().trim().min(1, dict.errors.productRequired).max(80, dict.errors.productMax),
  description: z
    .string()
    .trim()
    .max(300, dict.errors.descriptionMax)
    .transform((v) => v || null),
  // Typed as "1.250,50" or "1250.50" → "1250.50"
  price: z
    .string()
    .trim()
    .min(1, dict.errors.priceRequired)
    .transform(parsePrice)
    .pipe(
      z
        .number({ error: dict.errors.priceInvalid })
        .min(0, dict.errors.priceNegative)
        .max(1_000_000, dict.errors.priceTooHigh),
    )
    .transform((n) => n.toFixed(2)),
  isAvailable: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});

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
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return firstIssue(parsed.error);

  await db.insert(categories).values({
    shopId,
    name: parsed.data.name,
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
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return firstIssue(parsed.error);

  const updated = await db
    .update(categories)
    .set({ name: parsed.data.name })
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

const idList = z.array(z.uuid()).max(500);

/**
 * Saves a new category order. `orderedIds` is the full list as shown in the editor;
 * ids that aren't the shop's are ignored by the WHERE clause.
 */
export async function reorderCategories(orderedIds: string[]): Promise<ActionState> {
  const shopId = await requireShopId();
  const ids = idList.parse(orderedIds);
  await db.transaction(async (tx) => {
    for (const [sortOrder, id] of ids.entries()) {
      await tx
        .update(categories)
        .set({ sortOrder, updatedAt: sql`${categories.updatedAt}` })
        .where(and(eq(categories.id, id), eq(categories.shopId, shopId)));
    }
  });
  menuChanged(shopId);
  return { ok: true };
}

// ---------- Products ----------

/** Saves a new item order within one of the shop's categories. */
export async function reorderProducts(categoryId: string, orderedIds: string[]): Promise<ActionState> {
  const shopId = await requireShopId();
  const ids = idList.parse(orderedIds);
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, z.uuid().parse(categoryId)), eq(categories.shopId, shopId)));
  if (!category) return { error: dict.errors.categoryNotFound };

  await db.transaction(async (tx) => {
    for (const [sortOrder, id] of ids.entries()) {
      // Keep updated_at: moving an item isn't an edit ("Recently updated" on the overview).
      await tx
        .update(products)
        .set({ sortOrder, updatedAt: sql`${products.updatedAt}` })
        .where(and(eq(products.id, id), eq(products.categoryId, category.id)));
    }
  });
  menuChanged(shopId);
  return { ok: true };
}

function readProduct(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    isAvailable: formData.get("isAvailable"),
  });
}

/** The uploaded photo (if any) and whether the existing one should be removed. */
function readImage(formData: FormData) {
  const image = formData.get("image");
  const file = image instanceof File && image.size > 0 ? image : null;
  const invalid = file ? validateImage(file) : null;
  return { file, remove: formData.get("removeImage") === "true", error: invalid && dict.errors[invalid] };
}

/** Uploads the photo, turning storage failures into a form error. */
async function tryUpload(shopId: string, file: File): Promise<{ url: string } | { error: string }> {
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
    .select({ id: products.id, categoryId: products.categoryId, imageUrl: products.imageUrl })
    .from(products)
    .where(and(eq(products.id, productId), inArray(products.categoryId, shopCategoryIds(shopId))));
  return product;
}

/** The category picked in the product form, if the shop owns it. */
async function findOwnedCategory(formData: FormData, shopId: string) {
  const categoryId = formData.get("categoryId");
  if (typeof categoryId !== "string" || !z.uuid().safeParse(categoryId).success) return undefined;
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.shopId, shopId)));
  return category;
}

/** sort_order that puts a product last in its category. */
function lastInCategory(categoryId: string) {
  return sql<number>`(select coalesce(max(${products.sortOrder}), -1) + 1 from ${products} where ${products.categoryId} = ${categoryId})`;
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const shopId = await requireShopId();
  const parsed = readProduct(formData);
  if (!parsed.success) return firstIssue(parsed.error);
  const image = readImage(formData);
  if (image.error) return { error: image.error };

  const category = await findOwnedCategory(formData, shopId);
  if (!category) return { error: dict.errors.categoryNotFound };
  const categoryId = category.id;

  let imageUrl: string | null = null;
  if (image.file) {
    const upload = await tryUpload(shopId, image.file);
    if ("error" in upload) return upload;
    imageUrl = upload.url;
  }
  try {
    await db.insert(products).values({
      ...parsed.data,
      imageUrl,
      categoryId,
      sortOrder: lastInCategory(categoryId),
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
  const parsed = readProduct(formData);
  if (!parsed.success) return firstIssue(parsed.error);
  const image = readImage(formData);
  if (image.error) return { error: image.error };

  const existing = await findOwnedProduct(productId, shopId);
  if (!existing) return { error: dict.errors.productNotFound };
  const category = await findOwnedCategory(formData, shopId);
  if (!category) return { error: dict.errors.categoryNotFound };
  // Moving to another category puts the item at the end of it.
  const move = category.id === existing.categoryId ? {} : { categoryId: category.id, sortOrder: lastInCategory(category.id) };

  let imageUrl = existing.imageUrl;
  if (image.file) {
    const upload = await tryUpload(shopId, image.file);
    if ("error" in upload) return upload;
    imageUrl = upload.url;
  } else if (image.remove) {
    imageUrl = null;
  }

  try {
    await db
      .update(products)
      .set({ ...parsed.data, ...move, imageUrl })
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
