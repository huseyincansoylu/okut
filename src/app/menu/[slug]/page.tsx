import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPublicMenu, type PublicMenu } from "@/lib/menu";
import { MenuItem } from "./menu-item";

export async function generateMetadata({ params }: PageProps<"/menu/[slug]">): Promise<Metadata> {
  const menu = await getPublicMenu((await params).slug);
  if (!menu) return { title: "Menü bulunamadı" };
  return { title: `${menu.shop.name} · Menü`, description: `${menu.shop.name} menüsü ve fiyatları` };
}

export default function MenuPage({ params }: PageProps<"/menu/[slug]">) {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <Menu params={params} />
    </Suspense>
  );
}

async function Menu({ params }: Pick<PageProps<"/menu/[slug]">, "params">) {
  const menu = await getPublicMenu((await params).slug);
  if (!menu) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="bg-primary px-4 pt-14 pb-12 text-center text-primary-foreground">
        <h1 className="font-heading text-4xl font-bold">{menu.shop.name}</h1>
        <p className="mt-2 text-sm opacity-70">Menü</p>
      </header>

      {menu.sections.length === 0 ? (
        <p className="px-4 py-16 text-center text-muted-foreground">Menü henüz hazırlanıyor.</p>
      ) : (
        <>
          <CategoryNav sections={menu.sections} />
          <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-6">
            {menu.sections.map((section) => (
              <section key={section.id} id={`c-${section.id}`} className="scroll-mt-16">
                <h2 className="mb-1 font-heading text-xl font-semibold">{section.name}</h2>
                <ul className="divide-y">
                  {section.products.map((product) => (
                    <MenuItem key={product.id} product={product} />
                  ))}
                </ul>
              </section>
            ))}
          </main>
        </>
      )}

      <footer className="mt-auto px-4 py-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">
          Okut ile oluşturuldu
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
