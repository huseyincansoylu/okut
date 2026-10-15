import { asc, eq, inArray } from "drizzle-orm";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { categories, products, type Product } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { dict, fill, plural } from "@/lib/dictionary";
import { getOwnedShop } from "@/lib/shops";
import { MenuBoard } from "./menu-board";
import { NoShop } from "./no-shop";
import { PageBody, PageHeader } from "./page-header";

export async function MenuEditor() {
  const shop = await getOwnedShop(await requireUserId());
  if (!shop) return <NoShop />;
  const t = dict.dashboard.menu;

  const categoryRows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.shopId, shop.id))
    .orderBy(asc(categories.sortOrder), asc(categories.createdAt));

  const productRows = categoryRows.length
    ? await db
        .select()
        .from(products)
        .where(inArray(products.categoryId, categoryRows.map((c) => c.id)))
        .orderBy(asc(products.sortOrder), asc(products.createdAt))
    : [];

  const productsByCategory = Map.groupBy(productRows, (p: Product) => p.categoryId);

  return (
    <PageBody>
      <PageHeader
        title={t.title}
        description={fill(t.summary, {
          categories: plural(t.categoryCount, categoryRows.length),
          products: plural(t.productCount, productRows.length),
        })}
        actions={
          <Link href={`/menu/${shop.slug}`} target="_blank" className={buttonVariants({ variant: "outline" })}>
            {dict.dashboard.viewLiveMenu}
            <ExternalLinkIcon />
          </Link>
        }
      />
      <MenuBoard categories={categoryRows.map((c) => ({ ...c, products: productsByCategory.get(c.id) ?? [] }))} />
    </PageBody>
  );
}
