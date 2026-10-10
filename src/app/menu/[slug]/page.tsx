import type { Metadata } from "next";
import { UtensilsCrossedIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { getPublicMenu, type PublicMenu } from "@/lib/menu";

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
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-1 flex-col">
      <header className="px-4 pt-8 pb-4 text-center">
        <h1 className="font-heading text-3xl font-bold">{menu.shop.name}</h1>
      </header>

      {menu.sections.length === 0 ? (
        <p className="px-4 py-16 text-center text-muted-foreground">Menü henüz hazırlanıyor.</p>
      ) : (
        <>
          <CategoryNav sections={menu.sections} />
          <main className="flex flex-col gap-10 px-4 py-6">
            {menu.sections.map((section) => (
              <section key={section.id} id={`c-${section.id}`} className="scroll-mt-16">
                <h2 className="mb-3 font-heading text-xl font-semibold">{section.name}</h2>
                <ul className="divide-y">
                  {section.products.map((product) => (
                    <li
                      key={product.id}
                      className={`flex gap-4 py-4 ${product.isAvailable ? "" : "opacity-50"}`}
                    >
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={80}
                          height={80}
                          sizes="80px"
                          className="size-20 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          aria-hidden
                          className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                        >
                          <UtensilsCrossedIcon className="size-6 opacity-60" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{product.name}</h3>
                            {!product.isAvailable && <Badge variant="secondary">Tükendi</Badge>}
                          </div>
                          <span className="shrink-0 font-semibold tabular-nums">{formatPrice(product.price)}</span>
                        </div>
                        {product.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </main>
        </>
      )}

      <footer className="mt-auto px-4 py-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">
          Dijital Menü ile oluşturuldu
        </Link>
      </footer>
    </div>
  );
}

function CategoryNav({ sections }: { sections: PublicMenu["sections"] }) {
  return (
    <nav className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <ul className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
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
    <div className="mx-auto w-full max-w-2xl animate-pulse px-4 pt-8">
      <div className="mx-auto h-8 w-48 rounded-md bg-muted" />
      <div className="mt-8 flex flex-col gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-12 rounded-md bg-muted" />
        ))}
      </div>
    </div>
  );
}
