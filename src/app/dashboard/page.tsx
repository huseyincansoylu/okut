import { desc, eq } from "drizzle-orm";
import {
  ArrowRightIcon,
  CheckIcon,
  CircleCheckIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  ImageOffIcon,
  PackageIcon,
  PrinterIcon,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { dict, fill, INTL_LOCALE, plural } from "@/lib/dictionary";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { qrSvg } from "@/lib/qr";
import { getOwnedShop } from "@/lib/shops";
import { getMenuUrl } from "@/lib/site-url";
import { NoShop } from "./_components/no-shop";
import { PageBody, PageHeader, PageSkeleton } from "./_components/page-header";
import { CopyLinkButton } from "./_components/qr-actions";

export const metadata: Metadata = { title: dict.dashboard.overview.title };

export default function OverviewPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Overview />
    </Suspense>
  );
}

const panel = "rounded-3xl bg-card ring-1 ring-border/70";

async function Overview() {
  const shop = await getOwnedShop(await requireUserId());
  if (!shop) return <NoShop />;
  const t = dict.dashboard.overview;
  const percent = new Intl.NumberFormat(INTL_LOCALE, { style: "percent" });

  const [categoryRows, productRows, menuUrl] = await Promise.all([
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
    getMenuUrl(shop.slug),
  ]);
  const svg = await qrSvg(menuUrl);

  const soldOut = productRows.filter((p) => !p.isAvailable);
  const withImage = productRows.filter((p) => p.imageUrl).length;
  const missingImage = productRows.length - withImage;
  const missingDescription = productRows.filter((p) => !p.description).length;
  const isEmpty = productRows.length === 0;

  const setup = [
    { ...t.setup.category, done: categoryRows.length > 0, href: "/dashboard/menu" },
    { ...t.setup.product, done: productRows.length > 0, href: "/dashboard/menu" },
    { ...t.setup.photo, done: withImage > 0, href: "/dashboard/menu" },
    { ...t.setup.brand, done: Boolean(shop.logoUrl), href: "/dashboard/settings" },
  ];
  const setupDone = setup.filter((s) => s.done).length;

  const stats: { label: string; value: string | number; icon: LucideIcon; hint?: string; tone: string }[] = [
    { label: t.stats.categories, value: categoryRows.length, icon: FolderIcon, tone: "bg-sky-500/12 text-sky-600 dark:text-sky-400" },
    {
      label: t.stats.products,
      value: productRows.length,
      icon: PackageIcon,
      tone: "bg-primary/10 text-primary",
      hint: isEmpty ? undefined : fill(t.stats.onSale, { count: productRows.length - soldOut.length }),
    },
    { label: t.stats.soldOut, value: soldOut.length, icon: EyeOffIcon, tone: "bg-rose-500/12 text-rose-600 dark:text-rose-400" },
    {
      label: t.stats.withPhoto,
      value: isEmpty ? "—" : percent.format(withImage / productRows.length),
      icon: ImageIcon,
      tone: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
      hint: isEmpty ? undefined : fill(t.stats.withPhotoHint, { count: withImage, total: productRows.length }),
    },
  ];

  const tips = [
    missingImage > 0 && { icon: ImageOffIcon, text: plural(t.missingPhotos, missingImage) },
    missingDescription > 0 && { icon: FileTextIcon, text: plural(t.missingDescriptions, missingDescription) },
    soldOut.length > 0 && { icon: EyeOffIcon, text: fill(t.soldOutList, { items: soldOut.map((p) => p.name).join(", ") }) },
  ].filter((tip) => !!tip);

  return (
    <PageBody>
      <PageHeader
        title={t.greeting}
        description={fill(t.subtitle, { shop: shop.name })}
        actions={
          <>
            <Link href={`/menu/${shop.slug}`} target="_blank" className={buttonVariants({ variant: "outline" })}>
              {dict.dashboard.viewLiveMenu}
              <ExternalLinkIcon />
            </Link>
            <Link href="/dashboard/menu" className={buttonVariants()}>
              {t.editMenu}
              <ArrowRightIcon />
            </Link>
          </>
        }
      />

      {setupDone < setup.length && (
        <section className={`${panel} relative isolate overflow-hidden p-5 md:p-7`}>
          <div className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-extrabold tracking-tight">{t.setupTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{fill(t.setupText, { done: setupDone, total: setup.length })}</p>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={setup.length}
              aria-valuenow={setupDone}
              className="h-2 w-full overflow-hidden rounded-full bg-muted sm:w-48"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-brand-amber transition-[width] duration-700"
                style={{ width: `${(setupDone / setup.length) * 100}%` }}
              />
            </div>
          </div>
          <ol className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {setup.map((step, i) => (
              <li key={step.title}>
                <Link
                  href={step.href}
                  className={`group flex h-full items-start gap-3 rounded-2xl p-3.5 ring-1 transition-colors ${step.done ? "bg-muted/40 ring-transparent" : "bg-background ring-border/70 hover:ring-primary/40"}`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.done ? "bg-emerald-600 text-white" : "bg-brand-tint text-primary"}`}
                  >
                    {step.done ? <CheckIcon className="size-4" /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-sm font-semibold ${step.done ? "text-muted-foreground line-through decoration-1" : ""}`}>
                      {step.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{step.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, hint, tone }) => (
          <div key={label} className={`${panel} flex flex-col gap-3 p-4 md:p-5`}>
            <span className={`flex size-9 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="size-[1.1rem]" />
            </span>
            <div>
              <p className="font-heading text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
              {hint && <p className="mt-0.5 text-xs text-muted-foreground/80">{hint}</p>}
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className={`${panel} lg:col-span-3`}>
          <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 md:px-6">
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight">{t.recentTitle}</h2>
              <p className="text-sm text-muted-foreground">{t.recentText}</p>
            </div>
            <Link href="/dashboard/menu" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              {t.editMenu}
              <ArrowRightIcon />
            </Link>
          </header>
          {isEmpty ? (
            <div className="m-5 mt-2 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center md:mx-6">
              <p className="font-medium">{t.emptyTitle}</p>
              <p className="max-w-xs text-sm text-muted-foreground">{t.emptyText}</p>
              <Link href="/dashboard/menu" className={buttonVariants({ size: "sm" })}>
                {t.goToMenu}
                <ArrowRightIcon />
              </Link>
            </div>
          ) : (
            <ul className="divide-y px-2 pb-2">
              {productRows.slice(0, 6).map((product) => (
                <li key={product.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt="" width={44} height={44} className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-4 text-muted-foreground/60" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      {!product.isAvailable && (
                        <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                          {dict.common.soldOut}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {product.category} · {formatRelativeTime(product.updatedAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(product.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className={`${panel} p-5 md:p-6`}>
            <h2 className="font-heading text-lg font-bold tracking-tight">{t.healthTitle}</h2>
            <p className="text-sm text-muted-foreground">{t.healthText}</p>
            {isEmpty || tips.length === 0 ? (
              <p className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-3.5 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <CircleCheckIcon className="size-4" />
                {t.healthOk}
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {tips.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5 rounded-2xl bg-muted/60 px-3.5 py-3 text-sm">
                    <Icon className="mt-0.5 size-4 shrink-0 text-brand-amber" />
                    <span className="min-w-0">{text}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="relative isolate overflow-hidden rounded-3xl bg-[#24150f] p-5 text-[#f5ebe1] md:p-6 dark:ring-1 dark:ring-white/10">
            <div className="absolute -right-16 -bottom-20 -z-10 size-56 rounded-full bg-primary/40 blur-3xl" />
            <div className="flex items-center gap-4">
              {/* Generated by the qrcode library from our own URL, so it is safe to inline. */}
              <div className="size-24 shrink-0 rounded-2xl bg-white p-2 [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-bold tracking-tight">{t.qrTitle}</h2>
                <p className="mt-0.5 text-sm text-[#f5ebe1]/70">{t.qrText}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/qr" className={buttonVariants({ size: "sm" })}>
                <PrinterIcon />
                {t.goToQr}
              </Link>
              <CopyLinkButton url={menuUrl} className="bg-white/10 text-[#f5ebe1] hover:bg-white/20" />
            </div>
          </section>
        </div>
      </div>
    </PageBody>
  );
}
