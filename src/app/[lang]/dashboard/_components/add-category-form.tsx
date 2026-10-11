"use client";

import { useActionState, useEffect, useRef } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";
import { createCategory } from "../menu-actions";

export function AddCategoryForm() {
  const { dict } = useI18n();
  const t = dict.dashboard.menu;
  const [state, action, pending] = useActionState(createCategory, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input name="name" required maxLength={50} placeholder={t.newCategory} aria-label={t.categoryName} />
        <Input name="nameEn" maxLength={50} placeholder={t.newCategoryEn} aria-label={t.categoryNameEn} className="sm:max-w-56" />
        <Button type="submit" disabled={pending}>
          <PlusIcon />
          {t.addCategory}
        </Button>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
