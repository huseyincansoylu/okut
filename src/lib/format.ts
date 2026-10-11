import { INTL_LOCALES, type Locale } from "@/i18n/config";

const priceFormatters = new Map<Locale, Intl.NumberFormat>();

export function formatPrice(value: string | number, locale: Locale) {
  let formatter = priceFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(INTL_LOCALES[locale], {
      style: "currency",
      currency: "TRY",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    priceFormatters.set(locale, formatter);
  }
  return formatter.format(Number(value));
}

/** Languages that write prices with a decimal comma ("1.250,50"). */
const DECIMAL_COMMA: ReadonlySet<Locale> = new Set(["tr", "es"]);

/** "1250.50" → "1250,50" (tr, es) or "1250.50" (en) for editing in a price input. */
export function priceInputValue(value: string, locale: Locale) {
  const trimmed = value.replace(/\.00$/, "");
  return DECIMAL_COMMA.has(locale) ? trimmed.replace(".", ",") : trimmed;
}

/**
 * Parses a typed price in the visitor's format: "1.250,50" (tr, es) or "1,250.50" (en).
 * Returns NaN for anything that isn't a number.
 */
export function parsePrice(input: string, locale: Locale) {
  const normalized =
    DECIMAL_COMMA.has(locale) && input.includes(",")
      ? input.replace(/\./g, "").replace(",", ".")
      : input.replace(/,/g, "");
  return normalized.trim() === "" ? NaN : Number(normalized);
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "3 hours ago" / "3 saat önce", "yesterday", "now" */
export function formatRelativeTime(date: Date, locale: Locale, now = Date.now()) {
  const formatter = new Intl.RelativeTimeFormat(INTL_LOCALES[locale], { numeric: "auto" });
  const seconds = Math.round((date.getTime() - now) / 1000);
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
  }
  return formatter.format(0, "second");
}
