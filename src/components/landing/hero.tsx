import { ArrowRightIcon, CheckIcon, PlayIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { DemoQrCode } from "@/components/demo-qr";
import { LogoMark } from "@/components/logo";
import { PhoneMockup } from "@/components/phone-mockup";
import { buttonVariants } from "@/components/ui/button";
import { dict } from "@/lib/dictionary";

const t = dict.landing;

const floatingCard = "absolute z-10 rounded-2xl bg-card/90 shadow-xl shadow-foreground/10 ring-1 ring-border/70 backdrop-blur max-lg:hidden";

/** Landing hero: headline and calls to action beside the phone preview with floating UI cards. */
export function Hero() {
  return (
    <section className="relative isolate">
      {/* Backdrop: dotted grid fading out, and a warm glow behind the phone. */}
      <div className="absolute inset-x-0 -top-24 -z-10 h-[46rem] bg-dots [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute top-10 right-0 -z-10 size-[32rem] rounded-full bg-primary/15 blur-3xl md:right-10" />
      <div className="absolute top-60 right-60 -z-10 size-72 rounded-full bg-brand-amber/20 blur-3xl max-md:hidden" />

      <div className="grid items-center gap-14 pt-12 md:grid-cols-[1.15fr_1fr] md:pt-20">
        <div className="flex flex-col items-start gap-7 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          <p className="inline-flex items-center gap-2 rounded-full bg-card/80 py-1 pr-3.5 pl-1.5 text-sm font-medium shadow-sm ring-1 ring-border backdrop-blur">
            <span className="flex size-6 items-center justify-center rounded-full bg-brand-tint">
              <LogoMark className="size-3 text-primary" />
            </span>
            {t.eyebrow}
          </p>

          <h1 className="font-heading text-[2.75rem] leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {t.heroTitle.split("\n").map((line, i) => (
              <span
                key={line}
                className={
                  i === 1 ? "block bg-gradient-to-r from-primary to-brand-amber bg-clip-text pb-1 text-transparent" : "block"
                }
              >
                {line}
              </span>
            ))}
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">{t.heroText}</p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="?auth=signup"
              scroll={false}
              className={buttonVariants({ size: "lg", className: "shadow-lg shadow-primary/25" })}
            >
              {dict.common.createShop}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <a href="#demo" className={buttonVariants({ variant: "ghost", size: "lg" })}>
              <PlayIcon data-icon="inline-start" className="fill-current" />
              {t.heroSeeDemo}
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {t.heroPoints.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <CheckIcon className="size-4 text-primary" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-1000">
          <PhoneMockup />

          <div aria-hidden className={`${floatingCard} top-20 -left-44 flex items-center gap-3 p-3 pr-4 motion-safe:animate-float`}>
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <RefreshCwIcon className="size-4" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold">{t.floatingUpdated}</span>
              <span className="text-xs text-muted-foreground">{t.floatingUpdatedText}</span>
            </span>
          </div>

          <div
            aria-hidden
            className={`${floatingCard} top-72 -right-48 flex items-center gap-3 p-3 motion-safe:animate-float motion-safe:[animation-delay:-2.5s]`}
          >
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-muted-foreground line-through decoration-1">{t.floatingSoldOut}</span>
              <span className="mt-1 w-fit rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                {dict.common.soldOut}
              </span>
            </span>
            <span className="flex h-[18px] w-8 items-center rounded-full bg-input p-px">
              <span className="size-4 rounded-full bg-background shadow-sm" />
            </span>
          </div>

          <div
            aria-hidden
            className={`${floatingCard} bottom-6 -left-40 flex items-center gap-3 p-2.5 pr-4 motion-safe:animate-float motion-safe:[animation-delay:-4.5s]`}
          >
            <DemoQrCode className="size-12 rounded-lg p-1!" />
            <span className="text-sm font-semibold">{t.floatingScan}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
