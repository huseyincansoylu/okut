import { ArrowUpRightIcon, LogOutIcon, StoreIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Toaster } from "@/components/ui/toast";
import { requireUserId } from "@/lib/auth";
import { dict } from "@/lib/dictionary";
import { getOwnedShop } from "@/lib/shops";
import { DashboardNav } from "./_components/dashboard-nav";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <Toaster>
      <div className="flex min-h-full flex-1 flex-col md:flex-row">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-5 border-r bg-sidebar p-4 text-sidebar-foreground md:flex print:hidden">
          <Link href="/dashboard" aria-label="Okut" className="self-start px-2 pt-1">
            <Logo className="text-2xl" />
          </Link>
          <Suspense fallback={<div className="h-[4.5rem] animate-pulse rounded-2xl bg-muted" />}>
            <ShopCard />
          </Suspense>
          <DashboardNav variant="sidebar" />
          <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
            <SignOutButton />
            <ThemeSwitcher />
          </div>
        </aside>

        {/* Phone top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background/85 px-4 py-2.5 backdrop-blur-xl md:hidden print:hidden">
          <Link href="/dashboard" aria-label="Okut">
            <Logo className="text-xl" />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeSwitcher />
            <SignOutButton compact />
          </div>
        </header>

        <div className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0 print:pb-0">{children}</div>

        {/* Phone tab bar */}
        <DashboardNav variant="tabs" />
      </div>
    </Toaster>
  );
}

async function ShopCard() {
  const shop = await getOwnedShop(await requireUserId());
  if (!shop) return null;

  return (
    <div className="rounded-2xl bg-card p-2.5 shadow-sm ring-1 ring-border/70">
      <div className="flex min-w-0 items-center gap-2.5">
        {shop.logoUrl ? (
          <Image
            src={shop.logoUrl}
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-xl bg-white object-contain p-0.5 ring-1 ring-foreground/10"
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-primary">
            <StoreIcon className="size-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{shop.name}</p>
          <Link
            href={`/menu/${shop.slug}`}
            target="_blank"
            className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary"
          >
            {dict.dashboard.viewLiveMenu}
            <ArrowUpRightIcon className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        aria-label={compact ? dict.common.signOut : undefined}
        className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
      >
        <LogOutIcon className="size-4" />
        {!compact && dict.common.signOut}
      </button>
    </form>
  );
}
