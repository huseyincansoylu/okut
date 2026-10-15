"use client";

import { startTransition, useActionState, useState } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type { Product } from "@/db/schema";
import { dict, fill } from "@/lib/dictionary";
import { priceInputValue } from "@/lib/format";
import { createProduct, deleteProduct, updateProduct } from "../menu-actions";
import { ConfirmDelete } from "./confirm-delete";
import { ImageField } from "./image-field";

export type ProductTarget = { mode: "create"; categoryId: string } | { mode: "edit"; product: Product };

/** Side panel for adding or editing an item. Controlled by the menu editor. */
export function ProductSheet({
  target,
  onClose,
  categories,
}: {
  target: ProductTarget | null;
  onClose: () => void;
  categories: { id: string; name: string }[];
}) {
  const t = dict.dashboard.menu;
  // Keep the last target while the sheet animates closed. Each opening gets a new
  // form key, so adding two items in a row never carries over the previous fields.
  const [shown, setShown] = useState(target);
  const [formKey, setFormKey] = useState(0);
  if (target && target !== shown) {
    setShown(target);
    setFormKey((k) => k + 1);
  }

  return (
    <Sheet open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent closeLabel={dict.common.close}>
        {shown && (
          <>
            <SheetHeader>
              <SheetTitle>{shown.mode === "create" ? t.addProduct : t.editProduct}</SheetTitle>
            </SheetHeader>
            <ProductForm
              key={formKey}
              target={shown}
              categories={categories}
              onDone={onClose}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ProductForm({
  target,
  categories,
  onDone,
}: {
  target: ProductTarget;
  categories: { id: string; name: string }[];
  onDone: () => void;
}) {
  const t = dict.dashboard.menu;
  const product = target.mode === "edit" ? target.product : undefined;
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? (target.mode === "create" ? target.categoryId : ""));
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [description, setDescription] = useState(product?.description ?? "");
  const [imageBusy, setImageBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // `key` remounts the fields after "Save & add another" so they start empty.
  const [state, action, pending] = useActionState(
    async (prev: { key: number; error?: string }, formData: FormData) => {
      const result = product ? await updateProduct(product.id, undefined, formData) : await createProduct(undefined, formData);
      if (!result?.ok) return { key: prev.key, error: result?.error };

      toast.success(product ? t.productSaved : t.productAdded);
      if (formData.get("intent") === "another") {
        startTransition(() => {
          setIsAvailable(true);
          setDescription("");
        });
        return { key: prev.key + 1 };
      }
      startTransition(onDone);
      return { key: prev.key };
    },
    { key: 0 },
  );

  return (
    <form action={action} className="flex min-h-0 flex-1 flex-col">
      <div key={state.key} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-1 pb-6 sm:px-6">
        <ImageField initialUrl={product?.imageUrl} onBusyChange={setImageBusy} label={t.photo} />

        <div className="grid gap-2">
          <Label htmlFor="product-name">{t.productName}</Label>
          <Input
            id="product-name"
            name="name"
            required
            maxLength={80}
            defaultValue={product?.name}
            placeholder={t.productNamePlaceholder}
            autoFocus={!product}
            className="h-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="product-price">{t.price}</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">£</span>
              <Input
                id="product-price"
                name="price"
                inputMode="decimal"
                required
                placeholder={t.pricePlaceholder}
                defaultValue={product ? priceInputValue(product.price) : ""}
                className="h-10 pl-7 tabular-nums"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-category">{t.category}</Label>
            <select
              id="product-category"
              name="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="product-description">
              {t.description} <span className="font-normal text-muted-foreground">{dict.common.optional}</span>
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums">{description.length}/300</span>
          </div>
          <Textarea
            id="product-description"
            name="description"
            maxLength={300}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
          />
        </div>

        <label
          htmlFor="product-available"
          className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-muted/60 px-4 py-3.5 ring-1 ring-border/70"
        >
          <span className="flex flex-col gap-0.5">
            <span className="font-medium">{t.available}</span>
            <span className="text-xs text-muted-foreground">{t.availableHint}</span>
          </span>
          <Switch id="product-available" checked={isAvailable} onCheckedChange={setIsAvailable} />
        </label>
        <input type="hidden" name="isAvailable" value={String(isAvailable)} />

        {state.error && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
      </div>

      <footer className="flex items-center gap-2 border-t bg-muted/40 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-b-3xl sm:px-6">
        {product && (
          <>
            <Button type="button" variant="destructive" size="icon-lg" aria-label={t.deleteProduct} onClick={() => setConfirmOpen(true)}>
              <Trash2Icon />
            </Button>
            <ConfirmDelete
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title={fill(t.deleteTitle, { name: product.name })}
              description={t.cannotUndo}
              onConfirm={async () => {
                await deleteProduct(product.id);
                toast.success(t.productDeleted);
                startTransition(onDone);
              }}
            />
          </>
        )}
        <div className="ml-auto flex gap-2">
          {!product && (
            <Button type="submit" name="intent" value="another" variant="secondary" size="lg" disabled={pending || imageBusy}>
              {t.saveAndAddAnother}
            </Button>
          )}
          <Button type="submit" size="lg" disabled={pending || imageBusy}>
            {pending ? dict.common.saving : product ? dict.common.save : t.addProduct}
          </Button>
        </div>
      </footer>
    </form>
  );
}
