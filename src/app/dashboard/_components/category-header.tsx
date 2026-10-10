"use client";

import { useActionState, useState } from "react";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteCategory, updateCategory, type ActionState } from "../menu-actions";
import { ConfirmDelete } from "./confirm-delete";

export function CategoryHeader({
  id,
  name,
  productCount,
}: {
  id: string;
  name: string;
  productCount: number;
}) {
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
          <Input name="name" defaultValue={name} required maxLength={50} autoFocus aria-label="Kategori adı" />
          <Button type="submit" size="sm" disabled={pending}>
            Kaydet
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Vazgeç
          </Button>
        </div>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </form>
    );
  }

  return (
    <div className="flex flex-1 items-center gap-1">
      <h2 className="flex-1 font-heading text-base font-semibold">{name}</h2>
      <Button variant="ghost" size="icon-sm" aria-label="Kategoriyi yeniden adlandır" onClick={() => setEditing(true)}>
        <PencilIcon />
      </Button>
      <ConfirmDelete
        label="Kategoriyi sil"
        title={`"${name}" silinsin mi?`}
        description={
          productCount > 0
            ? `Bu kategorideki ${productCount} ürün de silinecek. Bu işlem geri alınamaz.`
            : "Bu işlem geri alınamaz."
        }
        onConfirm={() => deleteCategory(id)}
      />
    </div>
  );
}
