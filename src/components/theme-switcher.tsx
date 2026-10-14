"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Menu } from "@base-ui/react/menu";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { cn } from "cn";
import { useI18n } from "@/i18n/client";
import { applyTheme, THEME_STORAGE_KEY, THEMES, type Theme } from "@/lib/theme";

const ICONS = { light: SunIcon, dark: MoonIcon, system: MonitorIcon } as const;

// The stored choice as an external store, so every switcher (and other tabs) stays in sync.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  // Another tab changed the theme: repaint this one too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    applyTheme(storedTheme());
    onChange();
  };
  listeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function storedTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES.includes(value as Theme) ? (value as Theme) : "system";
  } catch {
    return "system";
  }
}

/** Light / dark / system menu. The choice lives in localStorage on this device. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { dict } = useI18n();
  const labels = { light: dict.common.themeLight, dark: dict.common.themeDark, system: dict.common.themeSystem };
  // "system" on the server; the stored choice once hydrated.
  const theme = useSyncExternalStore(subscribe, storedTheme, () => "system" as const);

  // While following the device, react to it switching between light and dark.
  useEffect(() => {
    if (theme !== "system") return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  function choose(next: Theme) {
    applyTheme(next);
    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the theme still applies for this visit.
    }
    listeners.forEach((notify) => notify());
  }

  const Current = ICONS[theme];

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`${dict.common.theme}: ${labels[theme]}`}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full border outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:bg-accent",
          className,
        )}
      >
        <Current className="size-4" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="end" className="z-50">
          <Menu.Popup className="min-w-36 origin-(--transform-origin) rounded-xl bg-popover p-1 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none transition-[transform,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0">
            {THEMES.map((t) => {
              const Icon = ICONS[t];
              return (
                <Menu.Item
                  key={t}
                  onClick={() => choose(t)}
                  className="flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 outline-none select-none data-highlighted:bg-accent"
                >
                  <Icon className="size-4 opacity-70" />
                  <span className="flex-1">{labels[t]}</span>
                  {t === theme && <CheckIcon className="size-4 opacity-70" />}
                </Menu.Item>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
