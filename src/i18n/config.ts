// Shared by the proxy, server code and client components, so no server-only imports here.
export const LOCALES = ["en", "tr", "es"] as const;
export type Locale = (typeof LOCALES)[number];

/** Used when the browser prefers neither supported language. */
export const DEFAULT_LOCALE: Locale = "en";

/** Remembers the last visited language; Server Actions read it since they can't see the route. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** BCP 47 tags for Intl formatting. */
export const INTL_LOCALES: Record<Locale, string> = { en: "en-US", tr: "tr-TR", es: "es-ES" };

/** Shown in the language menu, each in its own language. */
export const LOCALE_OPTIONS: Record<Locale, { flag: string; name: string }> = {
  en: { flag: "🇬🇧", name: "English" },
  tr: { flag: "🇹🇷", name: "Türkçe" },
  es: { flag: "🇪🇸", name: "Español" },
};

export function hasLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** Picks the best supported language from an Accept-Language header. */
export function matchLocale(acceptLanguage: string | null): Locale {
  const preferred = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  const match = preferred.find((p) => hasLocale(p.lang));
  return match ? (match.lang as Locale) : DEFAULT_LOCALE;
}

/** Replaces `{name}` placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
