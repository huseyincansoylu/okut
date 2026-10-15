"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { dict } from "@/lib/dictionary";
import { formatPrice } from "@/lib/format";

const ITEMS = [
  { name: "Scones", price: 4.5 },
  { name: "Victoria Sponge", price: 4 },
  { name: "Carrot Cake", price: 4 },
];

/** A working miniature of the dashboard's sold-out switches. */
export function SoldOutDemo() {
  const [available, setAvailable] = useState([false, true, true]);

  return (
    <ul className="w-full max-w-64 divide-y rounded-2xl bg-card p-1.5 text-sm shadow-lg shadow-foreground/5 ring-1 ring-border/70">
      {ITEMS.map((item, i) => (
        <li key={item.name} className="flex items-center gap-3 px-2.5 py-2">
          <div className={`min-w-0 flex-1 transition-opacity ${available[i] ? "" : "opacity-50"}`}>
            <p className="truncate font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {available[i] ? formatPrice(item.price) : dict.common.soldOut}
            </p>
          </div>
          <Switch
            checked={available[i]}
            onCheckedChange={(checked) => setAvailable((prev) => prev.map((v, j) => (j === i ? checked : v)))}
            aria-label={`${item.name}: ${dict.landing.mock.available}`}
          />
        </li>
      ))}
    </ul>
  );
}
