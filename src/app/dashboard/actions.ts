"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { shops } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { createShop } from "@/lib/shops";

export type ShopFormState = { error?: string } | undefined;

const shopName = z.string().trim().min(2, "Dükkan adı en az 2 karakter olmalı.").max(60);

// Fallback for accounts whose shop was not created during sign-up.
export async function createMyShop(_prev: ShopFormState, formData: FormData): Promise<ShopFormState> {
  const userId = await requireUserId();
  const parsed = shopName.safeParse(formData.get("shopName"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [existing] = await db.select({ id: shops.id }).from(shops).where(eq(shops.ownerId, userId)).limit(1);
  if (existing) return { error: "Zaten bir dükkanınız var." };

  await createShop(userId, parsed.data);
  revalidatePath("/dashboard");
}
