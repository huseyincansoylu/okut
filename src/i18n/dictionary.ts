import type en from "./dictionaries/en";
import type { Locale } from "./config";

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

/** Shape every language must match; derived from the English source. */
export type Dictionary = Widen<typeof en>;

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  tr: () => import("./dictionaries/tr").then((m) => m.default),
  es: () => import("./dictionaries/es").then((m) => m.default),
};

export function loadDictionary(locale: Locale) {
  return loaders[locale]();
}
