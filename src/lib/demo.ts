import type { Locale } from "../i18n/config.ts";

// Read-only showcase shops, one per language, created by scripts/seed-demo-menu.mts.
// Each shows a café menu typical of that country, in its own currency.
// Not server-only: the seed script imports this outside Next.js.
export const DEMO_SHOPS: Record<Locale, { name: string; slug: string; currency: string; menuLanguage: Locale }> = {
  tr: { name: "Okut Cafe", slug: "okut-cafe-istanbul", currency: "TRY", menuLanguage: "tr" },
  en: { name: "Okut Cafe", slug: "okut-cafe-london", currency: "GBP", menuLanguage: "en" },
  es: { name: "Okut Cafe", slug: "okut-cafe-madrid", currency: "EUR", menuLanguage: "es" },
};
