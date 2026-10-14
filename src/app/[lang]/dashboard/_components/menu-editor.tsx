import { asc, eq, inArray } from "drizzle-orm";
import { ExternalLinkIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { db } from "@/db";
import { categories, products, type Product } from "@/db/schema";
import { fill } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { requireUserId } from "@/lib/auth";
import { getOwnedShop } from "@/lib/shops";
import { AddCategoryForm } from "./add-category-form";
import { CategoryHeader } from "./category-header";
import { NoShop } from "./no-shop";
import { PageBody, PageHeader } from "./page-header";
import { ProductDialog } from "./product-dialog";
import { ProductRow } from "./product-row";

export async function MenuEditor() {
  const [shop, locale, dict] = await Promise.all([requireUserId().then(getOwnedShop), getLocale(), getDictionary()]);
  if (!shop) return <NoShop />;
  const t = dict.dashboard.menu;
  // Only what the client forms need, not the whole shop row.
  const settings = { currency: shop.currency };

  const categoryRows = await db
    .select()
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
        description={fill(t.summary, { categories: categoryRows.length, products: productRows.length })}
        actions={
          <Link href={`/${locale}/menu/${shop.slug}`} target="_blank" className={buttonVariants({ variant: "secondary" })}>
            {dict.common.viewMenu}
            <ExternalLinkIcon />
          </Link>
        }
      />

      <AddCategoryForm />

      {categoryRows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t.noCategories}
        </p>
      ) : (
        categoryRows.map((category) => {
          const items = productsByCategory.get(category.id) ?? [];
          return (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-center gap-2">
                <CategoryHeader
                  id={category.id}
                  name={category.name}
                  productCount={items.length}
                />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {items.length > 0 ? (
                  <ul className="divide-y">
                    {items.map((product) => (
                      <ProductRow key={product.id} product={product} shop={settings} />
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.noProducts}</p>
                )}
                <ProductDialog
                  mode="create"
                  categoryId={category.id}
                  shop={settings}
                  trigger={
                    <Button variant="outline" size="sm" className="self-start">
                      <PlusIcon />
                      {t.addProduct}
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          );
        })
      )}
    </PageBody>
  );
}
