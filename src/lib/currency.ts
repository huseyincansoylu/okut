import type { Locale } from "@/i18n/config";

/** Currencies a shop can price its menu in (ISO 4217). */
export const CURRENCIES = ["TRY", "EUR", "GBP", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = "TRY";

export const CURRENCY_SYMBOLS: Record<Currency, string> = { TRY: "₺", EUR: "€", GBP: "£", USD: "$" };

export function currencySymbol(code: string) {
  return isCurrency(code) ? CURRENCY_SYMBOLS[code] : code;
}

function isCurrency(value: unknown): value is Currency {
  return CURRENCIES.includes(value as Currency);
}

/** A new shop's currency, set from the language it signs up in. */
export const SIGN_UP_CURRENCY: Record<Locale, Currency> = { tr: "TRY", es: "EUR", en: "GBP" };
