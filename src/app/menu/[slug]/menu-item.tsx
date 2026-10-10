"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { UtensilsCrossedIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { PublicMenu } from "@/lib/menu";

type Product = PublicMenu["sections"][number]["products"][number];

function Thumbnail({ product, className }: { product: Product; className: string }) {
  return product.imageUrl ? (
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={80}
      height={80}
      sizes="80px"
      className={`${className} object-cover`}
    />
  ) : (
    <div aria-hidden className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}>
      <UtensilsCrossedIcon className="size-6 opacity-60" />
    </div>
  );
}

/** A menu row that opens the product's details: a bottom sheet on phones, a dialog on larger screens. */
export function MenuItem({ product }: { product: Product }) {
  return (
    <li>
      <DialogPrimitive.Root>
        <DialogPrimitive.Trigger
          className={`flex w-full gap-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${product.isAvailable ? "" : "opacity-50"}`}
        >
          <Thumbnail product={product} className="size-20 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">{product.name}</h3>
                {!product.isAvailable && <Badge variant="secondary">Tükendi</Badge>}
              </div>
              <span className="shrink-0 font-semibold tabular-nums">{formatPrice(product.price)}</span>
            </div>
            {product.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
            )}
          </div>
        </DialogPrimitive.Trigger>

        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Popup className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl outline-none duration-300 data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:duration-200 sm:data-open:fade-in-0 sm:data-open:zoom-in-95 sm:data-open:slide-in-from-bottom-0 sm:data-closed:fade-out-0 sm:data-closed:zoom-out-95 sm:data-closed:slide-out-to-bottom-0">
            <div className="overflow-y-auto">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={800}
                  height={800}
                  sizes="(min-width: 640px) 448px, 100vw"
                  className="aspect-square w-full bg-muted object-cover"
                />
              ) : (
                <div aria-hidden className="flex aspect-[2/1] w-full items-center justify-center bg-muted text-muted-foreground">
                  <UtensilsCrossedIcon className="size-10 opacity-50" />
                </div>
              )}

              <div className="flex flex-col gap-3 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <div className="flex items-start justify-between gap-4">
                  <DialogPrimitive.Title className="font-heading text-2xl font-semibold">
                    {product.name}
                  </DialogPrimitive.Title>
                  <span className="shrink-0 text-xl font-semibold tabular-nums">{formatPrice(product.price)}</span>
                </div>
                {!product.isAvailable && (
                  <Badge variant="secondary" className="self-start">
                    Tükendi
                  </Badge>
                )}
                {product.description && (
                  <DialogPrimitive.Description className="text-base leading-relaxed text-muted-foreground">
                    {product.description}
                  </DialogPrimitive.Description>
                )}
              </div>
            </div>

            <DialogPrimitive.Close
              aria-label="Kapat"
              className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <XIcon className="size-5" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </li>
  );
}
