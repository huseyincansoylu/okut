"use client";

import { useActionState, useEffect, useRef } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory } from "../menu-actions";

export function AddCategoryForm() {
  const [state, action, pending] = useActionState(createCategory, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input name="name" required maxLength={50} placeholder="Yeni kategori, örn. Sıcak İçecekler" aria-label="Kategori adı" />
        <Button type="submit" disabled={pending}>
          <PlusIcon />
          Kategori ekle
        </Button>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
