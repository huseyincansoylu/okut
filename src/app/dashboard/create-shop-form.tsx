"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMyShop } from "./actions";

export function CreateShopForm() {
  const [state, action, pending] = useActionState(createMyShop, undefined);

  return (
    <form action={action} className="flex flex-col gap-3 rounded-xl border p-4">
      <p className="text-sm">Henüz bir dükkanınız yok. Başlamak için dükkanınızın adını girin.</p>
      <div className="flex gap-2">
        <Input name="shopName" required minLength={2} maxLength={60} placeholder="Örn. Köşe Kafe" />
        <Button type="submit" disabled={pending}>
          Oluştur
        </Button>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
