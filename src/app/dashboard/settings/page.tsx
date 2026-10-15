import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { dict } from "@/lib/dictionary";
import { getOwnedShop } from "@/lib/shops";
import { NoShop } from "../_components/no-shop";
import { PageBody, PageHeader, PageSkeleton } from "../_components/page-header";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: dict.dashboard.settings.title };

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const shop = await getOwnedShop(await requireUserId());
  if (!shop) return <NoShop />;

  // A few real items for the live preview.
  const previewItems = await db
    .select({ name: products.name, price: products.price, imageUrl: products.imageUrl, description: products.description })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(categories.shopId, shop.id))
    .orderBy(asc(categories.sortOrder), asc(products.sortOrder))
    .limit(4);

  return (
    <PageBody>
      <PageHeader title={dict.dashboard.settings.title} description={dict.dashboard.settings.description} />
      <SettingsForm
        shop={{
          name: shop.name,
          logoUrl: shop.logoUrl,
          theme: shop.theme,
          wifiName: shop.wifiName,
          wifiPassword: shop.wifiPassword,
        }}
        previewItems={previewItems}
      />
    </PageBody>
  );
}
