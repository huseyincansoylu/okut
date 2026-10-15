"use client";

import { LayoutDashboardIcon, QrCodeIcon, SettingsIcon, UtensilsCrossedIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { dict } from "@/lib/dictionary";

const items = [
  { path: "", key: "overview", icon: LayoutDashboardIcon },
  { path: "/menu", key: "menu", icon: UtensilsCrossedIcon },
  { path: "/qr", key: "qr", icon: QrCodeIcon },
  { path: "/settings", key: "settings", icon: SettingsIcon },
] as const;

/** Dashboard navigation: a vertical list in the sidebar, or a bottom tab bar on phones. */
export function DashboardNav({ variant }: { variant: "sidebar" | "tabs" }) {
  const pathname = usePathname();
  const base = "/dashboard";

  const links = items.map(({ path, key, icon: Icon }) => {
    const href = base + path;
    const active = path === "" ? pathname === href : pathname.startsWith(href);
    const label = dict.dashboard.nav[key];

    if (variant === "tabs") {
      return (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium text-muted-foreground transition-colors",
            active && "text-primary",
          )}
        >
          <span
            className={cn(
              "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
              active && "bg-brand-tint",
            )}
          >
            <Icon className="size-5" />
          </span>
          {label}
        </Link>
      );
    }

    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
          active && "bg-card text-foreground shadow-sm ring-1 ring-border/70 hover:bg-card",
        )}
      >
        <Icon className={cn("size-[1.1rem]", active && "text-primary")} />
        {label}
      </Link>
    );
  });

  if (variant === "tabs") {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-40 flex gap-1 border-t bg-background/90 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden print:hidden">
        {links}
      </nav>
    );
  }
  return <nav className="flex flex-col gap-1">{links}</nav>;
}
