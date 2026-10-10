import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { shops } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { CreateShopForm } from "./create-shop-form";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Panel</h1>
        <form action={signOut}>
          <Button variant="ghost" size="sm">Çıkış yap</Button>
        </form>
      </header>

      <Suspense fallback={<p className="text-sm opacity-70">Yükleniyor...</p>}>
        <MyShop />
      </Suspense>
    </main>
  );
}

async function MyShop() {
  const userId = await requireUserId();
  const [shop] = await db.select().from(shops).where(eq(shops.ownerId, userId)).limit(1);

  if (!shop) return <CreateShopForm />;

  return (
    <section className="flex flex-col gap-1 rounded-md border p-4">
      <h2 className="text-lg font-medium">{shop.name}</h2>
      <p className="text-sm opacity-70">
        Menü adresi: <span className="font-mono">/menu/{shop.slug}</span>
      </p>
    </section>
  );
}
