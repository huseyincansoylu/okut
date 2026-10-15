"use client";

import { useActionState, useState } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon, ImageIcon, PaletteIcon, StoreIcon, WifiIcon, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { dict } from "@/lib/dictionary";
import { formatPrice } from "@/lib/format";
import { MENU_THEMES, menuTheme, type MenuTheme } from "@/lib/menu-themes";
import { updateShopSettings } from "../actions";
import { ImageField } from "../_components/image-field";

type ShopSettings = {
  name: string;
  logoUrl: string | null;
  theme: string;
  wifiName: string | null;
  wifiPassword: string | null;
};

type PreviewItem = { name: string; price: string; imageUrl: string | null; description: string | null };

const t = dict.dashboard.settings;

function Section({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-5 ring-1 ring-border/70 md:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-primary">
          <Icon className="size-[1.1rem]" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

export function SettingsForm({ shop, previewItems }: { shop: ShopSettings; previewItems: PreviewItem[] }) {
  // What was last saved; "dirty" compares against it.
  const [saved, setSaved] = useState(shop);
  const [name, setName] = useState(shop.name);
  const [theme, setTheme] = useState(shop.theme);
  const [wifiName, setWifiName] = useState(shop.wifiName ?? "");
  const [wifiPassword, setWifiPassword] = useState(shop.wifiPassword ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [logo, setLogo] = useState(shop.logoUrl);
  const [logoKey, setLogoKey] = useState(0);
  const [imageBusy, setImageBusy] = useState(false);
  // After a save, refresh() re-renders the page with the stored values (trimmed name,
  // uploaded logo URL). Adopt them so the form matches what customers now see.
  const shopKey = JSON.stringify(shop);
  const [savedKey, setSavedKey] = useState(shopKey);
  if (shopKey !== savedKey) {
    setSavedKey(shopKey);
    setSaved(shop);
    setName(shop.name);
    setTheme(shop.theme);
    setWifiName(shop.wifiName ?? "");
    setWifiPassword(shop.wifiPassword ?? "");
    setLogo(shop.logoUrl);
    setLogoKey((k) => k + 1);
  }

  const dirty =
    name !== saved.name ||
    theme !== saved.theme ||
    wifiName !== (saved.wifiName ?? "") ||
    wifiPassword !== (saved.wifiPassword ?? "") ||
    logo !== saved.logoUrl;

  const [state, action, pending] = useActionState(async (prev: { error?: string }, formData: FormData) => {
    const result = await updateShopSettings(undefined, formData);
    if (!result?.ok) return { error: result?.error };
    toast.success(dict.common.saved);
    return {};
  }, {});

  function discard() {
    setName(saved.name);
    setTheme(saved.theme);
    setWifiName(saved.wifiName ?? "");
    setWifiPassword(saved.wifiPassword ?? "");
    setLogo(saved.logoUrl);
    setLogoKey((k) => k + 1);
  }

  return (
    <form action={action} className="grid items-start gap-6 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
      <div className="flex flex-col gap-6">
        <Section icon={StoreIcon} title={t.infoTitle} text={t.infoText}>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="shop-name">{dict.auth.shopName}</Label>
              <Input
                id="shop-name"
                name="name"
                required
                minLength={2}
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">{t.slugHint}</p>
            </div>
            <ImageField
              key={logoKey}
              variant="tile"
              initialUrl={saved.logoUrl}
              onBusyChange={setImageBusy}
              onPreviewChange={setLogo}
              label={t.logo}
              hint={t.logoHint}
              fit="contain"
            />
          </div>
        </Section>

        <Section icon={PaletteIcon} title={t.appearanceTitle} text={t.appearanceText}>
          <fieldset>
            <legend className="sr-only">{t.color}</legend>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {(Object.entries(MENU_THEMES) as [MenuTheme, (typeof MENU_THEMES)[MenuTheme]][]).map(([key, preset]) => (
                <label key={key} className="group cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={key}
                    checked={theme === key}
                    onChange={() => setTheme(key)}
                    className="peer sr-only"
                  />
                  <span className="flex flex-col overflow-hidden rounded-2xl ring-1 ring-border transition-all group-hover:ring-foreground/30 peer-checked:ring-2 peer-checked:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                    <span className={cn("relative flex h-12 items-center justify-center", preset.header)}>
                      {theme === key && (
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                          <CheckIcon className="size-3.5" />
                        </span>
                      )}
                    </span>
                    <span className="bg-card px-2 py-1.5 text-center text-xs font-medium">{t.themes[key]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </Section>

        <Section icon={WifiIcon} title={t.wifiTitle} text={t.wifiText}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="wifi-name">{t.wifiName}</Label>
              <Input
                id="wifi-name"
                name="wifiName"
                maxLength={64}
                value={wifiName}
                onChange={(e) => setWifiName(e.target.value)}
                autoComplete="off"
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wifi-password">{t.wifiPassword}</Label>
              <div className="relative">
                <Input
                  id="wifi-password"
                  name="wifiPassword"
                  type={showPassword ? "text" : "password"}
                  maxLength={64}
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>
          </div>
        </Section>

        {state.error && (
          <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </p>
        )}
      </div>

      <aside className="lg:sticky lg:top-8">
        <p className="mb-3 text-sm font-medium">{t.preview}</p>
        <MenuPreview
          name={name.trim() || dict.auth.shopName}
          theme={theme}
          logo={logo}
          showWifi={Boolean(wifiPassword.trim())}
          items={previewItems}
        />
        <p className="mt-3 text-center text-xs text-muted-foreground">{t.previewText}</p>
      </aside>

      {/* Save bar: slides up while there are unsaved changes. */}
      <div
        aria-hidden={!dirty}
        className={cn(
          "fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-[#24150f] py-2.5 pr-2.5 pl-4 text-[#f5ebe1] shadow-2xl transition-all duration-300 md:bottom-6 md:left-[calc(16rem+1.5rem)] md:right-6 dark:ring-1 dark:ring-white/10",
          dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        )}
      >
        <span className="size-2 shrink-0 rounded-full bg-brand-amber" />
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{t.unsaved}</p>
        <Button type="button" variant="ghost" size="sm" onClick={discard} tabIndex={dirty ? 0 : -1} className="text-[#f5ebe1] hover:bg-white/10 hover:text-white">
          {t.discard}
        </Button>
        <Button type="submit" size="sm" disabled={pending || imageBusy} tabIndex={dirty ? 0 : -1}>
          {pending ? dict.common.saving : dict.common.save}
        </Button>
      </div>
    </form>
  );
}

/** A phone-sized copy of the public menu header with the current, unsaved settings. */
function MenuPreview({
  name,
  theme,
  logo,
  showWifi,
  items,
}: {
  name: string;
  theme: string;
  logo: string | null;
  showWifi: boolean;
  items: PreviewItem[];
}) {
  return (
    <div className="mx-auto w-full max-w-[20rem] rounded-[2.5rem] bg-[#24150f] p-2.5 shadow-2xl shadow-foreground/15 ring-1 ring-[#3a241b]">
      <div className="overflow-hidden rounded-[2rem] bg-background">
        <div className={cn("relative px-4 pt-10 pb-7 text-center transition-colors duration-300", menuTheme(theme).header)}>
          <span className="absolute top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-[#24150f]" />
          {showWifi && (
            <span className="absolute top-9 left-3 flex size-7 items-center justify-center rounded-full bg-background/70 text-foreground ring-1 ring-foreground/10">
              <WifiIcon className="size-3.5" />
            </span>
          )}
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element -- live preview of a saved or just-picked logo
            <img src={logo} alt="" className="mx-auto mb-2.5 size-14 rounded-2xl bg-white object-contain p-1 shadow-sm" />
          )}
          <p className="font-heading text-xl font-bold break-words">{name}</p>
          <p className="mt-0.5 text-[11px] opacity-60">{dict.menu.label}</p>
        </div>
        <ul className="flex min-h-48 flex-col divide-y px-4 py-2">
          {items.length === 0 ? (
            <li className="flex flex-1 items-center justify-center py-10 text-center text-xs text-muted-foreground">{t.previewEmpty}</li>
          ) : (
            items.map((item) => (
              <li key={item.name} className="flex items-center gap-2.5 py-2.5">
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- tiny preview thumbnail
                    <img src={item.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-3.5 text-muted-foreground/60" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{item.name}</span>
                  {item.description && <span className="block truncate text-[10px] text-muted-foreground">{item.description}</span>}
                </span>
                <span className="text-xs font-semibold tabular-nums">{formatPrice(item.price)}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
