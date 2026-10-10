import Link from "next/link";
import { DEMO_SHOP } from "@/lib/demo";
import { Logo } from "./logo";

const REPO_URL = "https://github.com/huseyincansoylu/okut";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/" aria-label="Okut ana sayfa" className="self-start">
            <Logo className="text-xl" />
          </Link>
          <p className="max-w-xs text-sm opacity-70">Kafe ve restoranlar için QR menü. Menünü oluştur, masaya koy, müşterin okutsun.</p>
        </div>

        <nav className="flex gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <p className="font-medium">Ürün</p>
            <Link href={`/menu/${DEMO_SHOP.slug}`} target="_blank" className="opacity-70 hover:opacity-100">
              Örnek menü
            </Link>
            <Link href="?auth=signup" scroll={false} className="opacity-70 hover:opacity-100">
              Ücretsiz başla
            </Link>
            <Link href="?auth=login" scroll={false} className="opacity-70 hover:opacity-100">
              Giriş yap
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">Proje</p>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100">
              GitHub
            </a>
          </div>
        </nav>
      </div>
      <p className="border-t py-5 text-center text-xs opacity-60">© 2026 Okut</p>
    </footer>
  );
}
