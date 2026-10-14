import { LogOutIcon, StoreIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/auth/actions";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/i18n/server";
import { requireUserId } from "@/lib/auth";
import { getOwnedShop } from "@/lib/shops";
import { DashboardNav } from "./_components/dashboard-nav";

export default async function DashboardLayout({ children }: LayoutProps<"/[lang]/dashboard">) {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="flex flex-col border-b bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:border-r md:border-b-0 print:hidden">
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2 md:px-5 md:pt-5">
          <Link href={`/${locale}/dashboard`} aria-label="Okut">
            <Logo className="text-xl" />
          </Link>
          <div className="flex shrink-0 items-center gap-1 md:hidden">
            <Suspense>
              <LocaleSwitcher />
            </Suspense>
            <SignOutButton label={dict.common.signOut} />
          </div>
        </div>

        <div className="px-3 pb-2">
          <Suspense fallback={<div className="h-12" />}>
            <ShopSummary />
          </Suspense>
        </div>

        <DashboardNav className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] md:flex-col md:px-3 md:pb-0" />

        <div className="mt-auto hidden items-center justify-between gap-2 border-t p-3 md:flex">
          <SignOutButton label={dict.common.signOut} />
          <Suspense>
            <LocaleSwitcher />
          </Suspense>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

async function ShopSummary() {
  const shop = await getOwnedShop(await requireUserId());
  if (!shop) return null;

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-background/60 px-2 py-2">
      {shop.logoUrl ? (
        <Image
          src={shop.logoUrl}
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-md bg-white object-contain ring-1 ring-foreground/10"
        />
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <StoreIcon className="size-4" />
        </span>
      )}
      <p className="min-w-0 flex-1 truncate text-sm font-medium">{shop.name}</p>
    </div>
  );
}

function SignOutButton({ label, className }: { label: string; className?: string }) {
  return (
    <form action={signOut} className={className}>
      <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
        <LogOutIcon />
        {label}
      </Button>
    </form>
  );
}
