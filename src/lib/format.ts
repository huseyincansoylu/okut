const priceFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(value: string | number) {
  return priceFormatter.format(Number(value));
}

/** "1250.50" → "1250,50" for editing in a Turkish-locale input. */
export function priceInputValue(value: string) {
  return value.replace(/\.00$/, "").replace(".", ",");
}

const relativeFormatter = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });
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
  return "şimdi";
}
