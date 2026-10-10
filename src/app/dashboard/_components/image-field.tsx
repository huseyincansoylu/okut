"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/compress-image";

/**
 * Photo picker for the product form. The compressed file is placed back into
 * the hidden `image` input so it is submitted with the rest of the FormData.
 */
export function ImageField({
  initialUrl,
  onBusyChange,
}: {
  initialUrl?: string | null;
  onBusyChange?: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Release object URLs created for local previews.
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const original = input.files?.[0];
    if (!original) return;

    setError(null);
    setBusy(true);
    onBusyChange?.(true);
    try {
      const compressed = await compressImage(original);
      const transfer = new DataTransfer();
      transfer.items.add(compressed);
      input.files = transfer.files;
      setPreview(URL.createObjectURL(compressed));
      setRemoved(false);
    } catch {
      input.value = "";
      setError("Bu fotoğraf okunamadı. JPEG veya PNG bir dosya deneyin.");
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  function handleRemove() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setRemoved(Boolean(initialUrl));
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">Fotoğraf (isteğe bağlı)</span>
      <div className="flex items-center gap-3">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {busy ? (
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {preview ? "Değiştir" : "Fotoğraf seç"}
          </Button>
          {preview && !busy && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
              <XIcon />
              Kaldır
            </Button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" name="image" accept="image/*" className="hidden" onChange={handleChange} />
      <input type="hidden" name="removeImage" value={String(removed)} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
