"use client";

import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dict } from "@/lib/dictionary";

export function PrintButton() {
  return (
    <Button onClick={() => window.print()}>
      <PrinterIcon />
      {dict.dashboard.qr.print}
    </Button>
  );
}
