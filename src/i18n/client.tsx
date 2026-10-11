"use client";

import { createContext, use } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionary";

const I18nContext = createContext<{ locale: Locale; dict: Dictionary } | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return <I18nContext value={{ locale, dict }}>{children}</I18nContext>;
}

/** The current language and its dictionary, for Client Components. */
export function useI18n() {
  const value = use(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
