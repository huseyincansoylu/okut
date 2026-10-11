import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, hasLocale, LOCALE_COOKIE, type Locale } from "./config";
import { loadDictionary } from "./dictionary";

/**
 * The visitor's language where the route isn't available (Server Actions, Route
 * Handlers, shared auth helpers). The proxy keeps this cookie in sync with the URL.
 */
export async function getRequestLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return hasLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getRequestDictionary() {
  return loadDictionary(await getRequestLocale());
}
