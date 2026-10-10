import { ExternalLinkIcon, LogOutIcon, StoreIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth";
import { getOwnedShop } from "@/lib/shops";
import { DashboardNav } from "./_components/dashboard-nav";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="flex flex-col border-b bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:border-r md:border-b-0 print:hidden">
        <div className="flex items-center justify-between gap-2 p-3">
          <Suspense fallback={<div className="h-12 flex-1" />}>
            <ShopSummary />
          </Suspense>
          <SignOutButton className="md:hidden" />
        </div>

        <DashboardNav className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] md:flex-col md:px-3 md:pb-0" />

        <div className="mt-auto hidden border-t p-3 md:block">
          <SignOutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

async function ShopSummary() {
  const shop = await getOwnedShop(await requireUserId());
  if (!shop) {
    return (
      <Link href="/dashboard" className="px-2 font-semibold">
        Okut
      </Link>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <StoreIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{shop.name}</p>
        <Link
          href={`/menu/${shop.slug}`}
          target="_blank"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
        >
          Menüyü görüntüle
          <ExternalLinkIcon className="size-3" />
        </Link>
      </div>
    </div>
  );
}

function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOut} className={className}>
      <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
        <LogOutIcon />
        Çıkış yap
      </Button>
    </form>
  );
}
