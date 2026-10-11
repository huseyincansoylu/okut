"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "cn";
import { useI18n } from "@/i18n/client";
import { LOCALE_LABELS, LOCALES } from "@/i18n/config";

/** TR / EN toggle that keeps the visitor on the same page. Needs a Suspense boundary. */
export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.size ? `?${searchParams}` : "";

  return (
    <nav aria-label={dict.common.language} className={cn("flex items-center rounded-full border p-0.5 text-xs", className)}>
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={`/${l}${pathname.slice(locale.length + 1)}${query}`}
          hrefLang={l}
          aria-current={l === locale ? "true" : undefined}
          scroll={false}
          className={cn(
            "rounded-full px-2.5 py-1 font-medium transition-colors",
            l === locale ? "bg-foreground text-background" : "opacity-60 hover:opacity-100",
          )}
        >
          {LOCALE_LABELS[l]}
        </Link>
      ))}
    </nav>
  );
}
