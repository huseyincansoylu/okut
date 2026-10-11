"use client";

import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

export function PrintButton() {
  const { dict } = useI18n();
  return (
    <Button size="sm" onClick={() => window.print()}>
      <PrinterIcon />
      {dict.dashboard.qr.print}
    </Button>
  );
}
