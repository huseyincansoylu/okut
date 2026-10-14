/** Menus are priced in Turkish lira for now (ISO 4217); the column allows others later. */
export const DEFAULT_CURRENCY = "TRY";

const CURRENCY_SYMBOLS: Record<string, string> = { TRY: "₺" };

export function currencySymbol(code: string) {
  return CURRENCY_SYMBOLS[code] ?? code;
}
