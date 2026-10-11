import type { Locale } from "@/i18n/config";

/** Currencies a shop can price its menu in (ISO 4217). */
export const CURRENCIES = ["TRY", "EUR", "GBP", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = "TRY";

export const CURRENCY_SYMBOLS: Record<Currency, string> = { TRY: "₺", EUR: "€", GBP: "£", USD: "$" };

export function currencySymbol(code: string) {
  return isCurrency(code) ? CURRENCY_SYMBOLS[code] : code;
}

export function isCurrency(value: unknown): value is Currency {
  return CURRENCIES.includes(value as Currency);
}

/**
 * A new shop's currency, guessed from the language it signs up in. English is
 * spoken in GBP, USD and EUR countries alike, so sign-up asks instead.
 */
export function defaultCurrencyFor(locale: Locale): Currency | null {
  if (locale === "tr") return "TRY";
  if (locale === "es") return "EUR";
  return null;
}
