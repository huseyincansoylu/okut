import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/server";
import { DEMO_SHOPS } from "@/lib/demo";
import { Logo } from "./logo";

const REPO_URL = "https://github.com/huseyincansoylu/okut";

export async function SiteFooter() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const t = dict.landing;

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Link href={`/${locale}`} aria-label="Okut" className="self-start">
            <Logo className="text-xl" />
          </Link>
          <p className="max-w-xs text-sm opacity-70">{t.footerTagline}</p>
        </div>

        <nav className="flex gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <p className="font-medium">{t.footerProduct}</p>
            <Link href={`/${locale}/menu/${DEMO_SHOPS[locale].slug}`} target="_blank" className="opacity-70 hover:opacity-100">
              {t.footerSampleMenu}
            </Link>
            <Link href="?auth=signup" scroll={false} className="opacity-70 hover:opacity-100">
              {dict.common.getStarted}
            </Link>
            <Link href="?auth=login" scroll={false} className="opacity-70 hover:opacity-100">
              {dict.common.signIn}
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">{t.footerProject}</p>
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
