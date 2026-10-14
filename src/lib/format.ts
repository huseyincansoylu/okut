import { INTL_LOCALE } from "@/lib/dictionary";

const priceFormatter = new Intl.NumberFormat(INTL_LOCALE, {
  style: "currency",
  currency: "TRY",
  currencyDisplay: "narrowSymbol",
  // "₺85,50" but "₺650"
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  trailingZeroDisplay: "stripIfInteger",
});

/** A price in Turkish lira: "₺85,50", "₺1.250". */
export function formatPrice(value: string | number) {
  return priceFormatter.format(Number(value));
}

/** "1250.50" → "1250,50" for editing in a price input. */
export function priceInputValue(value: string) {
  return value.replace(/\.00$/, "").replace(".", ",");
}

/**
 * Parses a typed price: "1.250,50", "1250,5" or "1250.50".
 * Returns NaN for anything that isn't a number.
 */
export function parsePrice(input: string) {
  const normalized = input.includes(",") ? input.replace(/\./g, "").replace(",", ".") : input;
  return normalized.trim() === "" ? NaN : Number(normalized);
}

const relativeFormatter = new Intl.RelativeTimeFormat(INTL_LOCALE, { numeric: "auto" });

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "3 saat önce", "dün", "şimdi" */
export function formatRelativeTime(date: Date, now = Date.now()) {
  const seconds = Math.round((date.getTime() - now) / 1000);
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return relativeFormatter.format(Math.round(seconds / size), unit);
  }
  return relativeFormatter.format(0, "second");
}
