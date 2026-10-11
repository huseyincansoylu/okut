"use client";

import { LayoutDashboardIcon, QrCodeIcon, SettingsIcon, UtensilsCrossedIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { useI18n } from "@/i18n/client";

const items = [
  { path: "", key: "overview", icon: LayoutDashboardIcon },
  { path: "/menu", key: "menu", icon: UtensilsCrossedIcon },
  { path: "/qr", key: "qr", icon: QrCodeIcon },
  { path: "/settings", key: "settings", icon: SettingsIcon },
] as const;

export function DashboardNav({ className }: { className?: string }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const base = `/${locale}/dashboard`;

  return (
    <nav className={className}>
      {items.map(({ path, key, icon: Icon }) => {
        const href = base + path;
        const active = path === "" ? pathname === href : pathname.startsWith(href);
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
            {dict.dashboard.nav[key]}
          </Link>
        );
      })}
    </nav>
  );
}
