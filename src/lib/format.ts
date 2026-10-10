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
