"use client";

import { Menu } from "@base-ui/react/menu";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "cn";
import { useI18n } from "@/i18n/client";
import { LOCALE_OPTIONS, LOCALES } from "@/i18n/config";

/** Language dropdown that keeps the visitor on the same page. Needs a Suspense boundary. */
export function LocaleSwitcher({ className, align = "end" }: { className?: string; align?: "start" | "end" }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rest = pathname.slice(locale.length + 1) + (searchParams.size ? `?${searchParams}` : "");
  const current = LOCALE_OPTIONS[locale];

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`${dict.common.language}: ${current.name}`}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:bg-muted",
          className,
        )}
      >
        <span aria-hidden className="text-base leading-none">
          {current.flag}
        </span>
        {locale.toUpperCase()}
        <ChevronDownIcon className="size-3.5 opacity-60" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align={align} className="z-50">
          <Menu.Popup className="min-w-40 origin-(--transform-origin) rounded-xl bg-popover p-1 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none transition-[transform,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0">
            {LOCALES.map((l) => (
              <Menu.LinkItem
                key={l}
                closeOnClick
                render={<Link href={`/${l}${rest}`} hrefLang={l} lang={l} scroll={false} />}
                aria-current={l === locale ? "true" : undefined}
                className="flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 outline-none select-none data-highlighted:bg-muted"
              >
                <span aria-hidden className="text-base leading-none">
                  {LOCALE_OPTIONS[l].flag}
                </span>
                <span className="flex-1">{LOCALE_OPTIONS[l].name}</span>
                {l === locale && <CheckIcon className="size-4 opacity-70" />}
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
