"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { menuTag } from "@/lib/menu";
import { getOwnedShop } from "@/lib/shops";

export type ActionState = { error?: string; ok?: boolean } | undefined;

const categorySchema = z.object({
  name: z.string().trim().min(1, "Kategori adı boş olamaz.").max(50, "Kategori adı en fazla 50 karakter olabilir."),
});

const productSchema = z.object({
  name: z.string().trim().min(1, "Ürün adı boş olamaz.").max(80, "Ürün adı en fazla 80 karakter olabilir."),
  description: z
    .string()
    .trim()
    .max(300, "Açıklama en fazla 300 karakter olabilir.")
    .transform((v) => v || null),
  // Accept Turkish formatting: "1.250,50" → 1250.50
  price: z
    .string()
    .trim()
    .min(1, "Fiyat boş olamaz.")
    .transform((v) => Number(v.includes(",") ? v.replace(/\./g, "").replace(",", ".") : v))
    .pipe(
      z
        .number({ error: "Geçerli bir fiyat girin." })
        .min(0, "Fiyat negatif olamaz.")
        .max(1_000_000, "Fiyat çok yüksek."),
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
  if (updated.length === 0) return { error: "Kategori bulunamadı." };

  menuChanged(shopId);
  return { ok: true };
}

export async function deleteCategory(categoryId: string): Promise<ActionState> {
  const shopId = await requireShopId();
  // Products are removed by the ON DELETE CASCADE foreign key.
  await db.delete(categories).where(and(eq(categories.id, categoryId), eq(categories.shopId, shopId)));
  menuChanged(shopId);
  return { ok: true };
}

// ---------- Products ----------

function readProduct(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    isAvailable: formData.get("isAvailable"),
  });
}

export async function createProduct(
  categoryId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const shopId = await requireShopId();
  const parsed = readProduct(formData);
  if (!parsed.success) return firstIssue(parsed.error);

  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.shopId, shopId)));
  if (!category) return { error: "Kategori bulunamadı." };

  await db.insert(products).values({
    ...parsed.data,
    categoryId,
    sortOrder: sql`(select coalesce(max(${products.sortOrder}), -1) + 1 from ${products} where ${products.categoryId} = ${categoryId})`,
  });
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

  const updated = await db
    .update(products)
    .set(parsed.data)
    .where(and(eq(products.id, productId), inArray(products.categoryId, shopCategoryIds(shopId))))
    .returning({ id: products.id });
  if (updated.length === 0) return { error: "Ürün bulunamadı." };

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
  await db
    .delete(products)
    .where(and(eq(products.id, productId), inArray(products.categoryId, shopCategoryIds(shopId))));
  menuChanged(shopId);
  return { ok: true };
}
