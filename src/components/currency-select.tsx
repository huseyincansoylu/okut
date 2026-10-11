"use client";

import { cn } from "cn";
import { useI18n } from "@/i18n/client";
import { INTL_LOCALES } from "@/i18n/config";
import { CURRENCIES, CURRENCY_SYMBOLS } from "@/lib/currency";

/** Native currency picker, labelled in the visitor's language ("€ Euro"). */
export function CurrencySelect({
  id,
  defaultValue,
  className,
}: {
  id: string;
  defaultValue: string;
  className?: string;
}) {
  const { locale } = useI18n();
  const names = new Intl.DisplayNames(INTL_LOCALES[locale], { type: "currency" });

  return (
    <select
      id={id}
      name="currency"
      defaultValue={defaultValue}
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
        className,
      )}
    >
      {CURRENCIES.map((code) => (
        <option key={code} value={code}>
          {CURRENCY_SYMBOLS[code]} {names.of(code)}
        </option>
      ))}
    </select>
  );
}
