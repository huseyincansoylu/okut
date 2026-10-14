"use client";

import { useActionState, useState } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dict } from "@/lib/dictionary";
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

export function SettingsForm({ shop }: { shop: ShopSettings }) {
  const t = dict.dashboard.settings;
  const [state, action, pending] = useActionState(updateShopSettings, undefined);
  const [name, setName] = useState(shop.name);
  const [theme, setTheme] = useState(shop.theme);
  const [imageBusy, setImageBusy] = useState(false);

  return (
    <form action={action} className="grid items-start gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>{t.infoTitle}</CardTitle>
          <CardDescription>{t.infoText}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
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
            />
            <p className="text-xs text-muted-foreground">
              {t.slugHint}
            </p>
          </div>

          <ImageField initialUrl={shop.logoUrl} onBusyChange={setImageBusy} label={t.logo} fit="contain" />

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">{t.color}</legend>
            <div className="flex flex-wrap gap-3">
              {(Object.entries(MENU_THEMES) as [MenuTheme, (typeof MENU_THEMES)[MenuTheme]][]).map(([key, preset]) => (
                <label key={key} className="flex cursor-pointer flex-col items-center gap-1.5 text-xs">
                  <input
                    type="radio"
                    name="theme"
                    value={key}
                    checked={theme === key}
                    onChange={() => setTheme(key)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full ring-1 ring-foreground/10 ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                      preset.swatch,
                    )}
                  >
                    {theme === key && <CheckIcon className={cn("size-4", key === "night" ? "text-white" : "text-foreground")} />}
                  </span>
                  {t.themes[key]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium">{t.wifiTitle}</legend>
            <p className="-mt-1 text-xs text-muted-foreground">{t.wifiText}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="wifi-name">{t.wifiName}</Label>
                <Input id="wifi-name" name="wifiName" maxLength={64} defaultValue={shop.wifiName ?? ""} autoComplete="off" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wifi-password">{t.wifiPassword}</Label>
                <Input
                  id="wifi-password"
                  name="wifiPassword"
                  maxLength={64}
                  defaultValue={shop.wifiPassword ?? ""}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
          </fieldset>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending || imageBusy}>
              {pending ? dict.common.saving : dict.common.save}
            </Button>
            {state?.ok && !pending && <p className="text-sm text-emerald-700 dark:text-emerald-400">{dict.common.saved}</p>}
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t.preview}</CardTitle>
          <CardDescription>{t.previewText}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <div className={cn("px-4 pt-8 pb-6 text-center", menuTheme(theme).header)}>
              {shop.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- small preview of the saved logo
                <img src={shop.logoUrl} alt="" className="mx-auto mb-3 size-14 rounded-2xl bg-white object-contain p-1 shadow-sm" />
              )}
              <p className="font-heading text-2xl font-bold">{name.trim() || dict.auth.shopName}</p>
              <p className="mt-1 text-xs opacity-60">{dict.menu.label}</p>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-10 rounded-md bg-muted" />
                  <div className="h-3 flex-1 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t.previewLogoHint}</p>
        </CardContent>
      </Card>
    </form>
  );
}
