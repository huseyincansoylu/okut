"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, DownloadIcon, PrinterIcon } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { Button, buttonVariants } from "@/components/ui/button";

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

export function QrActions({ url, svg, slug }: { url: string; svg: string; slug: string }) {
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
        <Button variant="ghost" size="sm" onClick={copyLink} aria-label="Linki kopyala">
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Kopyalandı" : "Kopyala"}
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
        <Link href="/dashboard/qr" target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <PrinterIcon />
          Masa kartı yazdır
        </Link>
      </div>
    </div>
  );
}
