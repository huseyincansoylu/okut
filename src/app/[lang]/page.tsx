import { Suspense } from "react";
import Link from "next/link";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { DemoQr } from "@/components/demo-qr";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logo } from "@/components/logo";
import { PhoneMockup } from "@/components/phone-mockup";
import { SiteFooter } from "@/components/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function Home() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const t = dict.landing;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <Link href={`/${locale}`} aria-label="Okut">
            <Logo />
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-4">
            <Suspense>
              <LocaleSwitcher />
            </Suspense>
            <Link href="?auth=login" scroll={false} className={buttonVariants({ variant: "ghost" })}>
              {dict.common.signIn}
            </Link>
            <Link href="?auth=signup" scroll={false} className={`${buttonVariants()} max-sm:hidden`}>
              {dict.common.getStarted}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-24 px-6 pb-24">
        <section className="grid items-center gap-12 pt-10 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl leading-tight font-bold whitespace-pre-line md:text-5xl">{t.heroTitle}</h1>
            <p className="text-lg opacity-70">{t.heroText}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="?auth=signup" scroll={false} className={buttonVariants({ size: "lg" })}>
                {dict.common.createShop}
              </Link>
              <Link href="?auth=login" scroll={false} className={buttonVariants({ variant: "outline", size: "lg" })}>
                {dict.common.signIn}
              </Link>
            </div>
          </div>

          <PhoneMockup />
        </section>

        <DemoQr />

        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-semibold">{t.featuresTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.features.map((f) => (
              <div key={f.title} className="rounded-lg border p-5">
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-1 text-sm opacity-70">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-semibold">{t.stepsTitle}</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {t.steps.map((step, i) => (
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
          <h2 className="text-2xl font-semibold">{t.ctaTitle}</h2>
          <p className="max-w-md opacity-70">{t.ctaText}</p>
          <Link href="?auth=signup" scroll={false} className={buttonVariants({ size: "lg" })}>
            {dict.common.getStarted}
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
