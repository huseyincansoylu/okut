// Color presets a shop can pick for its public menu header. Class names are
// written out in full so Tailwind can find them; labels live in the dictionaries.
export const MENU_THEMES = {
  sage: { header: "bg-emerald-50 dark:bg-emerald-950/40", swatch: "bg-emerald-100" },
  sky: { header: "bg-sky-50 dark:bg-sky-950/40", swatch: "bg-sky-100" },
  rose: { header: "bg-rose-50 dark:bg-rose-950/40", swatch: "bg-rose-100" },
  violet: { header: "bg-violet-50 dark:bg-violet-950/40", swatch: "bg-violet-100" },
  sand: { header: "bg-stone-100 dark:bg-stone-900", swatch: "bg-stone-200" },
  night: { header: "bg-neutral-900 text-white dark:bg-neutral-950", swatch: "bg-neutral-900" },
} as const;

export type MenuTheme = keyof typeof MENU_THEMES;

export const DEFAULT_THEME: MenuTheme = "sage";

export function isMenuTheme(value: unknown): value is MenuTheme {
  return typeof value === "string" && Object.hasOwn(MENU_THEMES, value);
}

export function menuTheme(value: string) {
  return MENU_THEMES[isMenuTheme(value) ? value : DEFAULT_THEME];
}
