"use client";

import { useOptimistic, useTransition } from "react";
import Image from "next/image";
import { ImageIcon, PencilIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Product } from "@/db/schema";
import { useI18n } from "@/i18n/client";
import { fill } from "@/i18n/config";
import { formatPrice } from "@/lib/format";
import { deleteProduct, setProductAvailability } from "../menu-actions";
import { ConfirmDelete } from "./confirm-delete";
import { ProductDialog } from "./product-dialog";

export function ProductRow({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const t = dict.dashboard.menu;
  const [, startTransition] = useTransition();
  const [isAvailable, setOptimistic] = useOptimistic(product.isAvailable);

  function toggle(next: boolean) {
    startTransition(async () => {
      setOptimistic(next);
      await setProductAvailability(product.id, next);
    });
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt="" width={48} height={48} className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={isAvailable ? "font-medium" : "font-medium text-muted-foreground line-through"}>
            {product.name}
          </span>
          {!isAvailable && <Badge variant="secondary">{dict.common.soldOut}</Badge>}
        </div>
        {product.description && (
          <p className="truncate text-sm text-muted-foreground">{product.description}</p>
        )}
      </div>

      <span className="shrink-0 font-medium tabular-nums">{formatPrice(product.price, locale)}</span>

      <Switch
        checked={isAvailable}
        onCheckedChange={toggle}
        aria-label={isAvailable ? t.markSoldOut : t.markAvailable}
      />
      <ProductDialog
        mode="edit"
        product={product}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label={t.editProduct}>
            <PencilIcon />
          </Button>
        }
      />
      <ConfirmDelete
        label={t.deleteProduct}
        title={fill(t.deleteTitle, { name: product.name })}
        description={t.cannotUndo}
        onConfirm={() => deleteProduct(product.id)}
      />
    </li>
  );
}
