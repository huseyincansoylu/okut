"use client";

import { useActionState, useState } from "react";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";
import { fill } from "@/i18n/config";
import { deleteCategory, updateCategory, type ActionState } from "../menu-actions";
import { ConfirmDelete } from "./confirm-delete";

export function CategoryHeader({
  id,
  name,
  nameEn,
  showEnglish,
  productCount,
}: {
  id: string;
  name: string;
  nameEn: string;
  showEnglish: boolean;
  productCount: number;
}) {
  const { dict } = useI18n();
  const t = dict.dashboard.menu;
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await updateCategory(id, prev, formData);
    if (result?.ok) setEditing(false);
    return result;
  }, undefined);

  if (editing) {
    return (
      <form action={action} className="flex flex-1 flex-col gap-1">
        <div className="flex gap-2">
          <Input name="name" defaultValue={name} required maxLength={50} autoFocus aria-label={t.categoryName} />
          <Button type="submit" size="sm" disabled={pending}>
            {dict.common.save}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
            {dict.common.cancel}
          </Button>
        </div>
        {showEnglish && (
          <Input name="nameEn" defaultValue={nameEn} maxLength={50} placeholder={t.newCategoryEn} aria-label={t.categoryNameEn} />
        )}
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </form>
    );
  }

  return (
    <div className="flex flex-1 items-center gap-1">
      <h2 className="flex-1 font-heading text-base font-semibold">{name}</h2>
      <Button variant="ghost" size="icon-sm" aria-label={t.renameCategory} onClick={() => setEditing(true)}>
        <PencilIcon />
      </Button>
      <ConfirmDelete
        label={t.deleteCategory}
        title={fill(t.deleteTitle, { name })}
        description={productCount > 0 ? fill(t.deleteCategoryWithProducts, { count: productCount }) : t.cannotUndo}
        onConfirm={() => deleteCategory(id)}
      />
    </div>
  );
}
