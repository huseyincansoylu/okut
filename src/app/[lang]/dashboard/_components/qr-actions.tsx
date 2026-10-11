"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

export function QrActions({ url, svg, slug }: { url: string; svg: string; slug: string }) {
  const { dict } = useI18n();
  const t = dict.dashboard.qr;
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-sm">{url}</span>
        <Button variant="ghost" size="sm" onClick={copyLink} aria-label={t.copyLink}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? t.copied : t.copy}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={downloadPng}>
          <DownloadIcon />
          PNG
        </Button>
        <Button variant="outline" size="sm" onClick={downloadSvg}>
          <DownloadIcon />
          SVG
        </Button>
      </div>
    </div>
  );
}
