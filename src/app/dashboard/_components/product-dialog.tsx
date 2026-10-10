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
import { priceInputValue } from "@/lib/format";
import { createProduct, updateProduct, type ActionState } from "../menu-actions";
import { ImageField } from "./image-field";

type Props = { trigger: ReactElement } & (
  | { mode: "create"; categoryId: string; product?: never }
  | { mode: "edit"; product: Product; categoryId?: never }
);

export function ProductDialog(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={props.trigger} />
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{props.mode === "create" ? "Ürün ekle" : "Ürünü düzenle"}</DialogTitle>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts with a fresh form state. */}
        {open && <ProductForm {...props} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({ mode, categoryId, product, onDone }: Props & { onDone: () => void }) {
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
        <Label htmlFor="product-name">Ürün adı</Label>
        <Input id="product-name" name="name" required maxLength={80} defaultValue={product?.name} autoFocus />
      </div>
      <ImageField initialUrl={product?.imageUrl} onBusyChange={setImageBusy} />
      <div className="grid gap-2">
        <Label htmlFor="product-description">Açıklama (isteğe bağlı)</Label>
        <Textarea
          id="product-description"
          name="description"
          maxLength={300}
          rows={3}
          defaultValue={product?.description ?? ""}
          placeholder="Örn. Çift shot espresso, sütlü"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="product-price">Fiyat (₺)</Label>
        <Input
          id="product-price"
          name="price"
          inputMode="decimal"
          required
          placeholder="85,50"
          defaultValue={product ? priceInputValue(product.price) : ""}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="product-available">Satışta</Label>
        <Switch id="product-available" checked={isAvailable} onCheckedChange={setIsAvailable} />
        <input type="hidden" name="isAvailable" value={String(isAvailable)} />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <DialogFooter>
        <Button type="submit" disabled={pending || imageBusy}>
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </DialogFooter>
    </form>
  );
}
