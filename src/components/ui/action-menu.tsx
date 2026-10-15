"use client";

import { Fragment } from "react";
import { Menu } from "@base-ui/react/menu";
import { MoreHorizontalIcon, type LucideIcon } from "lucide-react";
import { cn } from "cn";

export type ActionMenuItem = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  /** Draws a separator above the item. */
  separated?: boolean;
};

/** A "⋯" button that opens a short list of actions. */
export function ActionMenu({ label, items, className }: { label: string; items: ActionMenuItem[]; className?: string }) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={label}
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:bg-accent data-popup-open:text-foreground",
          className,
        )}
      >
        <MoreHorizontalIcon className="size-4" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={4} align="end" className="z-50">
          <Menu.Popup className="min-w-44 origin-(--transform-origin) rounded-xl bg-popover p-1 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none transition-[transform,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            {items.map(({ label: itemLabel, icon: Icon, onClick, destructive, disabled, separated }) => (
              <Fragment key={itemLabel}>
                {separated && <Menu.Separator className="mx-1 my-1 h-px bg-border" />}
                <Menu.Item
                  onClick={onClick}
                  disabled={disabled}
                  className={cn(
                    "flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 outline-none select-none data-disabled:opacity-40 data-highlighted:bg-accent",
                    destructive && "text-destructive data-highlighted:bg-destructive/10",
                  )}
                >
                  <Icon className="size-4 opacity-70" />
                  {itemLabel}
                </Menu.Item>
              </Fragment>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
