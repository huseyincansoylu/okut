"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { CheckIcon, CopyIcon, WifiIcon, XIcon } from "lucide-react";
import { useI18n } from "@/i18n/client";

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. some in-app browsers); the password is still visible.
    }
  }
  return { copied, copy };
}

/**
 * Guest Wi-Fi as an icon in the menu header. It opens a bottom sheet on phones
 * and a centered dialog on larger screens.
 */
export function WifiBadge({ name, password }: { name: string | null; password: string }) {
  const { dict } = useI18n();
  const { copied, copy } = useCopy(password);
  const title = name || dict.menu.wifi;
  const copyLabel = copied ? dict.menu.copied : dict.menu.copy;
  const CopyGlyph = copied ? CheckIcon : CopyIcon;

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger
        aria-label={dict.menu.wifi}
        className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground ring-1 ring-foreground/10 backdrop-blur outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <WifiIcon className="size-4" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-5 rounded-t-3xl bg-background px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center shadow-2xl outline-none duration-300 data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:pt-8 sm:pb-6 sm:duration-200 sm:data-open:fade-in-0 sm:data-open:zoom-in-95 sm:data-open:slide-in-from-bottom-0 sm:data-closed:fade-out-0 sm:data-closed:zoom-out-95 sm:data-closed:slide-out-to-bottom-0">
          <span aria-hidden className="h-1 w-10 rounded-full bg-foreground/15 sm:hidden" />
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <WifiIcon className="size-7" />
          </span>
          <div className="grid gap-1">
            <DialogPrimitive.Title className="font-heading text-xl font-semibold">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {dict.menu.wifiPassword}
            </DialogPrimitive.Description>
          </div>
          <p className="w-full rounded-2xl bg-muted px-4 py-3 font-mono text-2xl tracking-wide break-all select-all">
            {password}
          </p>
          <button
            type="button"
            onClick={copy}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-base font-medium text-background active:opacity-90"
          >
            <CopyGlyph className="size-5" />
            {copyLabel}
          </button>
          <DialogPrimitive.Close
            aria-label={dict.common.close}
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <XIcon className="size-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
