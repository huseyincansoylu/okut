"use client";

import { useActionState, useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/db/schema";
import { useI18n } from "@/i18n/client";
import { priceInputValue } from "@/lib/format";
import { createProduct, updateProduct, type ActionState } from "../menu-actions";
import { ImageField } from "./image-field";

type Props = { trigger: ReactElement } & (
  | { mode: "create"; categoryId: string; product?: never }
  | { mode: "edit"; product: Product; categoryId?: never }
);

export function ProductDialog(props: Props) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={props.trigger} />
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{props.mode === "create" ? dict.dashboard.menu.addProduct : dict.dashboard.menu.editProduct}</DialogTitle>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts with a fresh form state. */}
        {open && <ProductForm {...props} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({ mode, categoryId, product, onDone }: Props & { onDone: () => void }) {
  const { locale, dict } = useI18n();
  const t = dict.dashboard.menu;
  const english = product?.translations.en;
  const [state, action, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result =
      mode === "create"
        ? await createProduct(categoryId, prev, formData)
        : await updateProduct(product.id, prev, formData);
    if (result?.ok) onDone();
    return result;
  }, undefined);
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [imageBusy, setImageBusy] = useState(false);

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="product-name">{t.productName}</Label>
        <Input id="product-name" name="name" required maxLength={80} defaultValue={product?.name} autoFocus />
      </div>
      <ImageField initialUrl={product?.imageUrl} onBusyChange={setImageBusy} label={t.photo} />
      <div className="grid gap-2">
        <Label htmlFor="product-description">
          {t.description} {dict.common.optional}
        </Label>
        <Textarea
          id="product-description"
          name="description"
          maxLength={300}
          rows={3}
          defaultValue={product?.description ?? ""}
          placeholder={t.descriptionPlaceholder}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="product-price">{t.price}</Label>
        <Input
          id="product-price"
          name="price"
          inputMode="decimal"
          required
          placeholder={t.pricePlaceholder}
          defaultValue={product ? priceInputValue(product.price, locale) : ""}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="product-available">{t.available}</Label>
        <Switch id="product-available" checked={isAvailable} onCheckedChange={setIsAvailable} />
        <input type="hidden" name="isAvailable" value={String(isAvailable)} />
      </div>

      <fieldset className="grid gap-3 rounded-lg border p-3">
        <legend className="px-1 text-sm font-medium">{t.englishSection}</legend>
        <p className="-mt-1 text-xs text-muted-foreground">{t.englishHint}</p>
        <div className="grid gap-2">
          <Label htmlFor="product-name-en">{t.productNameEn}</Label>
          <Input id="product-name-en" name="nameEn" maxLength={80} defaultValue={english?.name ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="product-description-en">{t.descriptionEn}</Label>
          <Textarea
            id="product-description-en"
            name="descriptionEn"
            maxLength={300}
            rows={2}
            defaultValue={english?.description ?? ""}
          />
        </div>
      </fieldset>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <DialogFooter>
        <Button type="submit" disabled={pending || imageBusy}>
          {pending ? dict.common.saving : dict.common.save}
        </Button>
      </DialogFooter>
    </form>
  );
}
