import type { Locale } from "@/i18n/config";

/** Currencies a shop can price its menu in (ISO 4217): one per supported language. */
const CURRENCY_SYMBOLS = { TRY: "₺", EUR: "€", GBP: "£" } as const;
export type Currency = keyof typeof CURRENCY_SYMBOLS;

/** A new shop's currency, set from the language it signs up in. */
export const SIGN_UP_CURRENCY: Record<Locale, Currency> = { tr: "TRY", es: "EUR", en: "GBP" };

export function currencySymbol(code: string) {
  return Object.hasOwn(CURRENCY_SYMBOLS, code) ? CURRENCY_SYMBOLS[code as Currency] : code;
}
