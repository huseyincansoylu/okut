"use client";

import { LayoutDashboardIcon, QrCodeIcon, SettingsIcon, UtensilsCrossedIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const items = [
  { href: "/dashboard", label: "Genel bakış", icon: LayoutDashboardIcon },
  { href: "/dashboard/menu", label: "Menü", icon: UtensilsCrossedIcon },
  { href: "/dashboard/qr", label: "QR kod", icon: QrCodeIcon },
  { href: "/dashboard/settings", label: "Ayarlar", icon: SettingsIcon },
] as const;

export function DashboardNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
