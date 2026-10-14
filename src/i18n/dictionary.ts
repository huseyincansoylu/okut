import type tr from "./dictionaries/tr";
import type { Locale } from "./config";

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

/** Shape every language must match; derived from the Turkish source. */
export type Dictionary = Widen<typeof tr>;

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  tr: () => import("./dictionaries/tr").then((m) => m.default),
};

export function loadDictionary(locale: Locale) {
  return loaders[locale]();
}
