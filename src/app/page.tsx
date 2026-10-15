import { Suspense } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, PlusIcon, XIcon } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { DemoQr } from "@/components/demo-qr";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Logo, LogoMark } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SiteFooter } from "@/components/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { dict } from "@/lib/dictionary";

const t = dict.landing;

/** Eyebrow, two-line title and intro shared by the landing sections. */
function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
      <p className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
        {eyebrow}
      </p>
      <h2 className="font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
        {title.split("\n").map((line, i) => (
          <span key={line} className={i === 1 ? "block text-muted-foreground" : "block"}>
            {line}
          </span>
        ))}
      </h2>
      {text && <p className="max-w-lg text-lg text-muted-foreground">{text}</p>}
    </div>
  );
}

export default function Home() {
  const nav = [
    { href: "#features", label: t.nav.features },
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#demo", label: t.nav.demo },
    { href: "#faq", label: t.nav.faq },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/" aria-label="Okut">
            <Logo className="text-[1.7rem]" />
          </Link>
          <nav className="flex items-center gap-1 text-sm max-md:hidden">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Link href="?auth=login" scroll={false} className={buttonVariants({ variant: "ghost" })}>
              {dict.common.signIn}
            </Link>
            <Link href="?auth=signup" scroll={false} className={`${buttonVariants()} max-sm:hidden`}>
              {dict.common.getStarted}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-28 px-6 pb-28 md:gap-36">
        <Hero />

        <section className="reveal -mt-10 md:-mt-16">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-border/70 ring-1 ring-border/70 md:grid-cols-4">
            {t.highlights.map((item) => (
              <li key={item.value} className="flex flex-col gap-1 bg-card px-6 py-6">
                <span className="font-heading text-2xl font-extrabold tracking-tight md:text-3xl">{item.value}</span>
                <span className="text-sm text-muted-foreground">{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="features" className="reveal flex scroll-mt-24 flex-col gap-12">
          <SectionHeading eyebrow={t.featuresEyebrow} title={t.featuresTitle} text={t.featuresText} />
          <Features />
        </section>

        <section id="how-it-works" className="reveal flex scroll-mt-24 flex-col gap-12">
          <SectionHeading eyebrow={t.stepsEyebrow} title={t.stepsTitle} />
          <ol className="relative grid gap-4 md:grid-cols-3 md:gap-6">
            {/* Dashed line joining the step numbers. */}
            <span aria-hidden className="absolute top-12 right-[16%] left-[16%] border-t-2 border-dashed border-border max-md:hidden" />
            {t.steps.map((step, i) => (
              <li key={step.title} className="relative flex flex-col items-center gap-3 rounded-3xl px-6 py-6 text-center">
                <span className="relative flex size-12 items-center justify-center rounded-2xl bg-primary font-heading text-lg font-extrabold text-primary-foreground shadow-lg ring-8 shadow-primary/25 ring-background">
                  {i + 1}
                </span>
                <h3 className="mt-2 font-heading text-xl font-bold tracking-tight">{step.title}</h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="reveal flex flex-col gap-12">
          <SectionHeading eyebrow={t.compareEyebrow} title={t.compareTitle} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-muted/60 p-7 ring-1 ring-border/70">
              <p className="font-heading text-lg font-bold text-muted-foreground">{t.compareBefore}</p>
              <ul className="mt-5 flex flex-col gap-3.5">
                {t.compare.map((row) => (
                  <li key={row.before} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                      <XIcon className="size-3" />
                    </span>
                    {row.before}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-card p-7 shadow-xl shadow-primary/10 ring-2 ring-primary/40">
              <LogoMark className="absolute -right-10 -bottom-10 size-44 text-primary/[0.06]" />
              <p className="flex items-center gap-2 font-heading text-lg font-bold">
                <LogoMark className="size-4 text-primary" />
                {t.compareAfter}
              </p>
              <ul className="mt-5 flex flex-col gap-3.5">
                {t.compare.map((row) => (
                  <li key={row.after} className="flex items-start gap-3 font-medium">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckIcon className="size-3" />
                    </span>
                    {row.after}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <DemoQr />

        <section id="faq" className="reveal grid scroll-mt-24 gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
          <div className="flex flex-col items-start gap-4">
            <p className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
              {t.faqEyebrow}
            </p>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-5xl">{t.faqTitle}</h2>
          </div>
          <div className="divide-y divide-border/70 border-y border-border/70">
            {t.faq.map((item) => (
              <details key={item.q} name="faq" className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg font-bold tracking-tight">
                  {item.q}
                  <PlusIcon className="size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="reveal relative isolate overflow-hidden rounded-[2rem] bg-primary px-6 py-16 text-center text-primary-foreground md:py-20">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(color-mix(in_oklch,currentColor_25%,transparent)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] bg-[size:20px_20px]" />
          <LogoMark className="absolute -top-10 -left-10 -z-10 size-48 -rotate-12 opacity-10" />
          <LogoMark className="absolute -right-12 -bottom-12 -z-10 size-56 rotate-12 opacity-10" />
          <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
            <h2 className="font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{t.ctaTitle}</h2>
            <p className="text-lg opacity-80">{t.ctaText}</p>
            <Link
              href="?auth=signup"
              scroll={false}
              className={buttonVariants({ variant: "secondary", size: "lg", className: "mt-2 shadow-xl" })}
            >
              {dict.common.getStarted}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />

      <Suspense>
        <AuthDialog />
      </Suspense>
    </div>
  );
}
