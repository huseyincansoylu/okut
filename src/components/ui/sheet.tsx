"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

/** A panel that slides in from the right on larger screens and up from the bottom on phones. */
function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetContent({
  className,
  children,
  closeLabel = "Close",
  ...props
}: SheetPrimitive.Popup.Props & { closeLabel?: string }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/25 transition-opacity duration-300 supports-backdrop-filter:backdrop-blur-[2px] data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col bg-popover text-sm text-popover-foreground shadow-2xl ring-1 ring-foreground/10 outline-none transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          // Phones: bottom sheet
          "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl data-ending-style:translate-y-full data-starting-style:translate-y-full",
          // Larger screens: right panel
          "sm:inset-y-2 sm:right-2 sm:left-auto sm:max-h-none sm:w-[28rem] sm:rounded-3xl sm:data-ending-style:translate-x-[calc(100%+1rem)] sm:data-ending-style:translate-y-0 sm:data-starting-style:translate-x-[calc(100%+1rem)] sm:data-starting-style:translate-y-0",
          className,
        )}
        {...props}
      >
        <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-foreground/15 sm:hidden" />
        {children}
        <SheetPrimitive.Close
          render={<Button variant="ghost" size="icon-sm" className="absolute top-4 right-4 sm:top-5 sm:right-5" />}
        >
          <XIcon />
          <span className="sr-only">{closeLabel}</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 px-5 pt-4 pb-3 pr-14 sm:px-6 sm:pt-6", className)} {...props} />;
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return <SheetPrimitive.Title className={cn("font-heading text-xl font-extrabold tracking-tight", className)} {...props} />;
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return <SheetPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle };
