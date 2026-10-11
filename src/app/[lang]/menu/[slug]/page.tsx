import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { fill } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { getPublicMenu, localizeMenu, type PublicMenu } from "@/lib/menu";
import { menuTheme } from "@/lib/menu-themes";
import { MenuItem } from "./menu-item";

export async function generateMetadata({ params }: PageProps<"/[lang]/menu/[slug]">): Promise<Metadata> {
  const [menu, dict] = await Promise.all([getPublicMenu((await params).slug), getDictionary()]);
  if (!menu) return { title: dict.menu.notFoundTitle };
  const shop = menu.shop.name;
  return { title: { absolute: fill(dict.menu.metaTitle, { shop }) }, description: fill(dict.menu.metaDescription, { shop }) };
}

export default function MenuPage({ params }: PageProps<"/[lang]/menu/[slug]">) {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <Menu params={params} />
    </Suspense>
  );
}

async function Menu({ params }: Pick<PageProps<"/[lang]/menu/[slug]">, "params">) {
  const [raw, locale, dict] = await Promise.all([getPublicMenu((await params).slug), getLocale(), getDictionary()]);
  if (!raw) notFound();
  const menu = localizeMenu(raw, locale);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className={`relative px-4 pt-14 pb-12 text-center ${menuTheme(menu.shop.theme).header}`}>
        <Suspense>
          <LocaleSwitcher className="absolute top-3 right-3 bg-background/70 text-foreground backdrop-blur" />
        </Suspense>
        {menu.shop.logoUrl && (
          <Image
            src={menu.shop.logoUrl}
            alt={fill(dict.menu.logoAlt, { shop: menu.shop.name })}
            width={96}
            height={96}
            sizes="96px"
            priority
            className="mx-auto mb-4 size-20 rounded-3xl bg-white object-contain p-1.5 shadow-sm"
          />
        )}
        <h1 className="font-heading text-4xl font-bold">{menu.shop.name}</h1>
        <p className="mt-2 text-sm opacity-60">{dict.menu.label}</p>
      </header>

      {menu.sections.length === 0 ? (
        <p className="px-4 py-16 text-center text-muted-foreground">{dict.menu.preparing}</p>
      ) : (
        <>
          <CategoryNav sections={menu.sections} />
          <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-6">
            {menu.sections.map((section) => (
              <section key={section.id} id={`c-${section.id}`} className="scroll-mt-16">
                <h2 className="mb-1 font-heading text-xl font-semibold">{section.name}</h2>
                <ul className="divide-y">
                  {section.products.map((product) => (
                    <MenuItem key={product.id} product={product} currency={menu.shop.currency} />
                  ))}
                </ul>
              </section>
            ))}
          </main>
        </>
      )}

      <footer className="mt-auto px-4 py-8 text-center text-xs text-muted-foreground">
        <Link href={`/${locale}`} className="hover:underline">
          {dict.menu.madeWith}
        </Link>
      </footer>
    </div>
  );
}

function CategoryNav({ sections }: { sections: PublicMenu["sections"] }) {
  return (
    <nav className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <ul className="mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
        {sections.map((section) => (
          <li key={section.id} className="shrink-0">
            <a
              href={`#c-${section.id}`}
              className="block rounded-full border px-3 py-1 text-sm whitespace-nowrap hover:bg-muted"
            >
              {section.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MenuSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-36 bg-muted" />
      <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-4 px-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-20 rounded-md bg-muted" />
        ))}
      </div>
    </div>
  );
}
