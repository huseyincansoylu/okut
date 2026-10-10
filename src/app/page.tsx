import { Suspense } from "react";
import Link from "next/link";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { DemoQr } from "@/components/demo-qr";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { buttonVariants } from "@/components/ui/button";

const features = [
  { title: "Kategoriler", text: "Kahvaltı, içecekler, tatlılar... Menünü istediğin gibi bölümlere ayır." },
  { title: "Fiyat ve fotoğraf", text: "Her ürüne fiyat, açıklama ve fotoğraf ekle. Değişiklikler anında yayında." },
  { title: "QR kod ile paylaş", text: "Masalara QR kod koy. Müşterilerin uygulama indirmeden, kayıt olmadan menüyü açar." },
  { title: "Tükendi etiketi", text: "Biten ürünü tek tıkla gizle, menüyü yeniden basmana gerek kalmasın." },
];

const steps = [
  "Dükkanının adıyla ücretsiz kayıt ol.",
  "Kategorileri ve ürünleri ekle.",
  "QR kodu masalara koy, menün yayında.",
];

const demoMenu = [
  { category: "Sıcak İçecekler", items: [["Türk Kahvesi", "60"], ["Latte", "85"], ["Çay", "20"]] },
  { category: "Tatlılar", items: [["San Sebastian", "140"], ["Brownie", "110"]] },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" aria-label="Okut ana sayfa">
          <Logo />
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="?auth=login" scroll={false} className={buttonVariants({ variant: "ghost" })}>
            Giriş yap
          </Link>
          <Link href="?auth=signup" scroll={false} className={buttonVariants()}>
            Ücretsiz başla
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-24 px-6 pb-24">
        <section className="grid items-center gap-12 pt-10 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Dükkanının menüsü, <br />
              müşterinin cebinde.
            </h1>
            <p className="text-lg opacity-70">
              Menünü dakikalar içinde oluştur, fiyatları ve fotoğrafları kendin güncelle. Müşterilerin QR kodu
              okutup menüyü anında görsün.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="?auth=signup" scroll={false} className={buttonVariants({ size: "lg" })}>
                Dükkanını oluştur
              </Link>
              <Link href="?auth=login" scroll={false} className={buttonVariants({ variant: "outline", size: "lg" })}>
                Giriş yap
              </Link>
            </div>
          </div>

          <div className="mx-auto w-64 rounded-[2.5rem] border-8 border-foreground/90 bg-background p-4 shadow-xl">
            <p className="text-center text-sm font-semibold">Köşe Kafe</p>
            <div className="mt-4 flex flex-col gap-4">
              {demoMenu.map(({ category, items }) => (
                <div key={category}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-60">{category}</p>
                  <ul className="flex flex-col gap-2">
                    {items.map(([name, price]) => (
                      <li key={name} className="flex items-center gap-2 text-sm">
                        <span className="size-8 shrink-0 rounded-md bg-amber-200/70 dark:bg-amber-500/30" />
                        <span className="flex-1">{name}</span>
                        <span className="font-medium">₺{price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <DemoQr />

        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-semibold">Neler yapabilirsin?</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border p-5">
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-1 text-sm opacity-70">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-semibold">3 adımda hazır</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step} className="flex gap-3 rounded-lg border p-5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-sm text-background">
                  {i + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl border p-10 text-center">
          <h2 className="text-2xl font-semibold">Menünü bugün yayına al</h2>
          <p className="max-w-md opacity-70">Kurulum yok, kart bilgisi yok. Sadece dükkanının adı ve e-postan.</p>
          <Link href="?auth=signup" scroll={false} className={buttonVariants({ size: "lg" })}>
            Ücretsiz başla
          </Link>
        </section>
      </main>

      <SiteFooter />

      <Suspense>
        <AuthDialog />
      </Suspense>
    </div>
  );
}
