import { desc, eq } from "drizzle-orm";
import {
  ArrowRightIcon,
  CircleCheckIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  ImageOffIcon,
  PackageIcon,
  QrCodeIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { getOwnedShop } from "@/lib/shops";
import { NoShop } from "./_components/no-shop";
import { PageBody, PageHeader, PageSkeleton } from "./_components/page-header";

export const metadata: Metadata = { title: "Genel bakış" };

export default function OverviewPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const shop = await getOwnedShop(await requireUserId());
  if (!shop) return <NoShop />;

  const [categoryRows, productRows] = await Promise.all([
    db.select({ id: categories.id }).from(categories).where(eq(categories.shopId, shop.id)),
    db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        description: products.description,
        imageUrl: products.imageUrl,
        isAvailable: products.isAvailable,
        updatedAt: products.updatedAt,
        category: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(eq(categories.shopId, shop.id))
      .orderBy(desc(products.updatedAt)),
  ]);

  const soldOut = productRows.filter((p) => !p.isAvailable);
  const withImage = productRows.filter((p) => p.imageUrl).length;
  const missingImage = productRows.length - withImage;
  const missingDescription = productRows.filter((p) => !p.description).length;
  const isEmpty = productRows.length === 0;

  const stats = [
    { label: "Kategori", value: categoryRows.length, icon: FolderIcon },
    { label: "Ürün", value: productRows.length, icon: PackageIcon },
    {
      label: "Tükenen",
      value: soldOut.length,
      icon: EyeOffIcon,
      hint: isEmpty ? undefined : `${productRows.length - soldOut.length} ürün satışta`,
    },
    {
      label: "Fotoğraflı",
      value: isEmpty ? "—" : `%${Math.round((withImage / productRows.length) * 100)}`,
      icon: ImageIcon,
      hint: isEmpty ? undefined : `${withImage} / ${productRows.length} ürün`,
    },
  ];

  const tips = [
    missingImage > 0 && { icon: ImageOffIcon, text: `${missingImage} üründe fotoğraf yok` },
    missingDescription > 0 && { icon: FileTextIcon, text: `${missingDescription} üründe açıklama yok` },
  ].filter((tip) => !!tip);

  return (
    <PageBody>
      <PageHeader
        title="Genel bakış"
        description={shop.name}
        actions={
          <Link href={`/menu/${shop.slug}`} target="_blank" className={buttonVariants({ variant: "outline" })}>
            Menüyü görüntüle
            <ExternalLinkIcon />
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <Card key={label} size="sm">
            <CardContent className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {label}
                <Icon className="size-4" />
              </div>
              <p className="text-3xl font-semibold tabular-nums">{value}</p>
              {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            </CardContent>
          </Card>
        ))}
      </section>

      {isEmpty ? (
        <Card>
          <CardHeader>
            <CardTitle>Menünü oluşturmaya başla</CardTitle>
            <CardDescription>Kategori ve ürünleri ekledikçe özetin burada görünecek.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/menu" className={buttonVariants()}>
              Menüye git
              <ArrowRightIcon />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Son güncellenenler</CardTitle>
              <CardDescription>En son düzenlediğin ürünler</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {productRows.slice(0, 6).map((product) => (
                  <li key={product.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        {!product.isAvailable && <Badge variant="secondary">Tükendi</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {product.category} · {formatRelativeTime(product.updatedAt)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular-nums">{formatPrice(product.price)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Menü sağlığı</CardTitle>
                <CardDescription>Müşterilerin için eksik kalanlar</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {tips.length === 0 && soldOut.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm">
                    <CircleCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Her şey yolunda görünüyor.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2 text-sm">
                    {tips.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-2">
                        <Icon className="size-4 text-muted-foreground" />
                        {text}
                      </li>
                    ))}
                    {soldOut.length > 0 && (
                      <li className="flex items-start gap-2">
                        <EyeOffIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <span>
                          Tükenen: {soldOut.map((p) => p.name).join(", ")}
                        </span>
                      </li>
                    )}
                  </ul>
                )}
                <Link
                  href="/dashboard/menu"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "self-start" })}
                >
                  Menüyü düzenle
                  <ArrowRightIcon />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR kod</CardTitle>
                <CardDescription>Masa kartını yazdır, menün müşterilerin cebinde olsun.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/qr" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <QrCodeIcon />
                  QR koda git
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageBody>
  );
}
