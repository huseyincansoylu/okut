"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";
import { createMyShop } from "./actions";

export function CreateShopForm() {
  const { dict } = useI18n();
  const [state, action, pending] = useActionState(createMyShop, undefined);

  return (
    <form action={action} className="flex flex-col gap-3 rounded-xl border p-4">
      <p className="text-sm">{dict.dashboard.noShopText}</p>
      <div className="flex gap-2">
        <Input name="shopName" required minLength={2} maxLength={60} placeholder={dict.dashboard.shopNamePlaceholder} aria-label={dict.auth.shopName} />
        <Button type="submit" disabled={pending}>
          {dict.dashboard.create}
        </Button>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
