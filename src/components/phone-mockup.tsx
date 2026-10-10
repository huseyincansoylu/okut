import { BatteryFullIcon, SignalIcon, WifiIcon } from "lucide-react";
import Image from "next/image";
import { DEMO_SHOP } from "@/lib/demo";
import { formatPrice } from "@/lib/format";
import { MENU_THEMES } from "@/lib/menu-themes";

// A static preview of the demo menu; prices match scripts/seed-demo-menu.mts.
const SECTIONS = [
  {
    name: "Sıcak İçecekler",
    items: [
      { name: "Türk Kahvesi", description: "Yanında lokum ile", price: 70, image: "/landing/turk-kahvesi.webp" },
      { name: "Latte", description: "Çift shot espresso ve süt", price: 90, image: "/landing/latte.webp" },
      { name: "Çay", description: "İnce belli bardakta", price: 20, image: "/landing/cay.webp" },
    ],
  },
  {
    name: "Tatlılar",
    items: [
      { name: "San Sebastian", description: "Çikolata sosu ile", price: 160, image: "/landing/cheesecake.webp" },
      { name: "Fıstıklı Baklava", description: "Antep fıstığı ile", price: 220, image: "/landing/baklava.webp" },
    ],
  },
];

const CATEGORIES = ["Kahvaltı", "Sıcak İçecekler", "Tatlılar"];

/** Landing hero illustration: the customer menu inside a phone frame. */
export function PhoneMockup() {
  return (
    <div aria-hidden className="relative mx-auto w-[19rem] [zoom:0.8]">
      {/* Side buttons */}
      <span className="absolute top-28 -left-[3px] h-8 w-[3px] rounded-l bg-neutral-800" />
      <span className="absolute top-40 -left-[3px] h-14 w-[3px] rounded-l bg-neutral-800" />
      <span className="absolute top-36 -right-[3px] h-20 w-[3px] rounded-r bg-neutral-800" />

      <div className="rounded-[3.25rem] bg-neutral-900 p-3 shadow-2xl ring-1 ring-neutral-700">
        <div className="relative flex h-[38rem] flex-col overflow-hidden rounded-[2.5rem] bg-background">
          {/* Status bar and dynamic island */}
          <div className={`relative flex items-center justify-between px-7 pt-3.5 pb-1 text-[11px] font-semibold ${MENU_THEMES.sage.header}`}>
            <span>9:41</span>
            <span className="absolute top-2.5 left-1/2 h-7 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
            <span className="flex items-center gap-1">
              <SignalIcon className="size-3" />
              <WifiIcon className="size-3" />
              <BatteryFullIcon className="size-4" />
            </span>
          </div>

          <div className={`px-4 pt-6 pb-6 text-center ${MENU_THEMES.sage.header}`}>
            <p className="font-heading text-2xl font-bold">{DEMO_SHOP.name}</p>
            <p className="mt-1 text-[11px] opacity-60">Menü</p>
          </div>

          <div className="flex gap-1.5 overflow-hidden border-b px-4 py-2.5">
            {CATEGORIES.map((category, i) => (
              <span
                key={category}
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] ${i === 1 ? "bg-foreground text-background" : ""}`}
              >
                {category}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-4 px-4 pt-4">
            {SECTIONS.map((section) => (
              <div key={section.name}>
                <p className="mb-1 text-sm font-semibold">{section.name}</p>
                <ul className="divide-y">
                  {section.items.map((item) => (
                    <li key={item.name} className="flex items-center gap-3 py-2">
                      <Image
                        src={item.image}
                        alt=""
                        width={48}
                        height={48}
                        sizes="48px"
                        className="size-12 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{item.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{item.description}</p>
                      </div>
                      <span className="text-[13px] font-semibold tabular-nums">{formatPrice(item.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Content continues below the fold */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
          <span className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-foreground/80" />
        </div>
      </div>
    </div>
  );
}
