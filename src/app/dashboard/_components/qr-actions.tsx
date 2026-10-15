"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import QRCode from "qrcode";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { dict } from "@/lib/dictionary";

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

function useCopy(url: string) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(dict.dashboard.qr.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the link is still visible to copy by hand.
    }
  }
  return { copied, copy };
}

export function CopyLinkButton({ url, className }: { url: string; className?: string }) {
  const t = dict.dashboard.qr;
  const { copied, copy } = useCopy(url);
  return (
    <Button variant="secondary" size="sm" onClick={copy} className={className}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? t.copied : t.copyLink}
    </Button>
  );
}

export function QrActions({ url, svg, slug }: { url: string; svg: string; slug: string }) {
  const t = dict.dashboard.qr;
  const { copied, copy } = useCopy(url);

  function downloadSvg() {
    const href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    download(href, `${slug}-qr.svg`);
    URL.revokeObjectURL(href);
  }

  async function downloadPng() {
    // Large enough to stay sharp when printed on a table card.
    const href = await QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M" });
    download(href, `${slug}-qr.png`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-2">
        <span className="text-sm font-medium">{t.linkTitle}</span>
        <div className="flex items-center gap-2 rounded-xl bg-muted/60 py-1.5 pr-1.5 pl-3.5 ring-1 ring-border/70">
          <span className="min-w-0 flex-1 truncate font-mono text-sm">{url}</span>
          <Button variant={copied ? "secondary" : "default"} size="sm" onClick={copy} aria-label={t.copyLink}>
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? t.copied : t.copy}
          </Button>
        </div>
      </div>
      <div className="grid gap-2">
        <span className="text-sm font-medium">{t.download}</span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "PNG", onClick: downloadPng },
            { label: "SVG", onClick: downloadSvg },
          ].map((format) => (
            <button
              key={format.label}
              type="button"
              onClick={format.onClick}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold ring-1 ring-border transition-colors hover:bg-accent hover:ring-primary/40",
              )}
            >
              <DownloadIcon className="size-4 text-primary" />
              {format.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t.downloadHint}</p>
      </div>
    </div>
  );
}
