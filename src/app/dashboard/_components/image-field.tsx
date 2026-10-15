"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlusIcon, Loader2Icon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/compress-image";
import { dict } from "@/lib/dictionary";

/**
 * Photo picker for dashboard forms: click or drop a file. The compressed file is
 * placed back into the hidden `image` input so it is submitted with the FormData.
 *
 * - "dropzone": a wide area for product photos.
 * - "tile": a small square with buttons beside it, for logos.
 */
export function ImageField({
  initialUrl,
  onBusyChange,
  onPreviewChange,
  label,
  hint,
  variant = "dropzone",
  fit = "cover",
}: {
  initialUrl?: string | null;
  onBusyChange?: (busy: boolean) => void;
  /** Called with the new preview URL (or null when removed). */
  onPreviewChange?: (url: string | null) => void;
  label: string;
  hint?: string;
  variant?: "dropzone" | "tile";
  /** "contain" keeps logos uncropped. */
  fit?: "cover" | "contain";
}) {
  const t = dict.dashboard.menu;
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Release object URLs created for local previews.
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function acceptFile(original: File) {
    const input = inputRef.current;
    if (!input) return;
    setError(null);
    setBusy(true);
    onBusyChange?.(true);
    try {
      const compressed = await compressImage(original);
      const transfer = new DataTransfer();
      transfer.items.add(compressed);
      input.files = transfer.files;
      const url = URL.createObjectURL(compressed);
      setPreview(url);
      setRemoved(false);
      onPreviewChange?.(url);
    } catch {
      input.value = "";
      setError(t.photoUnreadable);
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  function handleRemove() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setRemoved(Boolean(initialUrl));
    onPreviewChange?.(null);
  }

  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) void acceptFile(file);
    },
  };

  const image = preview && (
    // eslint-disable-next-line @next/next/no-img-element -- local blob or saved photo preview
    <img src={preview} alt="" className={cn("size-full", fit === "contain" ? "bg-white object-contain p-1.5" : "object-cover")} />
  );

  const inputs = (
    <>
      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) void acceptFile(file);
        }}
      />
      <input type="hidden" name="removeImage" value={String(removed)} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );

  if (variant === "tile") {
    return (
      <div className="grid gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            {...dropProps}
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            aria-label={preview ? t.changePhoto : t.choosePhoto}
            className={cn(
              "relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-muted/60 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary",
              preview && "border-solid border-border",
              dragging && "border-primary bg-brand-tint",
            )}
          >
            {busy ? <Loader2Icon className="size-5 animate-spin" /> : image || <ImagePlusIcon className="size-6" />}
          </button>
          <div className="flex flex-col items-start gap-1.5">
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
                {preview ? t.changePhoto : t.choosePhoto}
              </Button>
              {preview && !busy && (
                <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                  {t.removePhoto}
                </Button>
              )}
            </div>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
        </div>
        {inputs}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div
        {...dropProps}
        className={cn(
          "group relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-muted/50 transition-colors",
          preview ? "border-transparent" : "hover:border-primary/50 hover:bg-brand-tint/50",
          dragging && "border-primary bg-brand-tint",
        )}
      >
        {busy ? (
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        ) : preview ? (
          <>
            {image}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-3">
              <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
                <RefreshCwIcon />
                {t.changePhoto}
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={handleRemove} aria-label={t.removePhoto}>
                <Trash2Icon />
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 px-6 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-card text-primary shadow-sm ring-1 ring-border">
              <ImagePlusIcon className="size-5" />
            </span>
            <span className="text-sm font-medium">{t.choosePhoto}</span>
            <span className="max-w-60 text-xs text-muted-foreground">{hint ?? t.photoHint}</span>
          </button>
        )}
      </div>
      {inputs}
    </div>
  );
}
