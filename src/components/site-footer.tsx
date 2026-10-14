import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/server";
import { Logo } from "./logo";

const REPO_URL = "https://github.com/huseyincansoylu/okut";

export async function SiteFooter() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const t = dict.landing;

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Link href={`/${locale}`} aria-label="Okut" className="self-start">
            <Logo className="text-xl" />
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">{t.footerTagline}</p>
        </div>

        <nav className="flex gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <p className="font-medium">{t.footerProduct}</p>
            <Link href="?auth=signup" scroll={false} className="text-muted-foreground hover:text-foreground">
              {dict.common.getStarted}
            </Link>
            <Link href="?auth=login" scroll={false} className="text-muted-foreground hover:text-foreground">
              {dict.common.signIn}
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">{t.footerProject}</p>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              GitHub
            </a>
          </div>
        </nav>
      </div>
      <p className="border-t py-5 text-center text-xs text-muted-foreground">© 2026 Okut</p>
    </footer>
  );
}
