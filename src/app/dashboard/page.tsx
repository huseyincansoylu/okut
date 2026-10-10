import { Suspense } from "react";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { MenuEditor } from "./_components/menu-editor";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Menü yönetimi</h1>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            Çıkış yap
          </Button>
        </form>
      </header>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Yükleniyor...</p>}>
        <MenuEditor />
      </Suspense>
    </main>
  );
}
