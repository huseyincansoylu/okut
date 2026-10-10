"use client";

import { useOptimistic, useTransition } from "react";
import Image from "next/image";
import { ImageIcon, PencilIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Product } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { deleteProduct, setProductAvailability } from "../menu-actions";
import { ConfirmDelete } from "./confirm-delete";
import { ProductDialog } from "./product-dialog";

export function ProductRow({ product }: { product: Product }) {
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
          {!isAvailable && <Badge variant="secondary">Tükendi</Badge>}
        </div>
        {product.description && (
          <p className="truncate text-sm text-muted-foreground">{product.description}</p>
        )}
      </div>

      <span className="shrink-0 font-medium tabular-nums">{formatPrice(product.price)}</span>

      <Switch
        checked={isAvailable}
        onCheckedChange={toggle}
        aria-label={isAvailable ? "Tükendi olarak işaretle" : "Satışa aç"}
      />
      <ProductDialog
        mode="edit"
        product={product}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Ürünü düzenle">
            <PencilIcon />
          </Button>
        }
      />
      <ConfirmDelete
        label="Ürünü sil"
        title={`"${product.name}" silinsin mi?`}
        description="Bu işlem geri alınamaz."
        onConfirm={() => deleteProduct(product.id)}
      />
    </li>
  );
}
