import { BatteryFullIcon, SignalIcon, WifiIcon } from "lucide-react";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { DEMO_SHOPS } from "@/lib/demo";
import { formatPrice } from "@/lib/format";
import { MENU_THEMES } from "@/lib/menu-themes";

// A static preview of each language's demo café; items and prices match scripts/demo-menus/.
const SECTIONS = {
  tr: [
    {
      name: "Sıcak İçecekler",
      items: [
        { name: "Türk Kahvesi", description: "Yanında lokum ile", price: 70, image: "/landing/tr/turk-kahvesi.webp" },
        { name: "Latte", description: "Çift shot espresso ve süt", price: 90, image: "/landing/tr/latte.webp" },
        { name: "Çay", description: "İnce belli bardakta", price: 20, image: "/landing/tr/cay.webp" },
      ],
    },
    {
      name: "Tatlılar",
      items: [
        { name: "San Sebastian", description: "Çikolata sosu ile", price: 160, image: "/landing/tr/cheesecake.webp" },
        { name: "Fıstıklı Baklava", description: "Antep fıstığı ile", price: 220, image: "/landing/tr/baklava.webp" },
      ],
    },
  ],
  en: [
    {
      name: "Hot Drinks",
      items: [
        { name: "English Breakfast Tea", description: "Served with milk", price: 2.8, image: "/landing/en/breakfast-tea.webp" },
        { name: "Flat White", description: "Double ristretto, steamed milk", price: 3.4, image: "/landing/en/flat-white.webp" },
        { name: "Hot Chocolate", description: "Cream and marshmallows", price: 3.5, image: "/landing/en/hot-chocolate.webp" },
      ],
    },
    {
      name: "Cakes & Bakes",
      items: [
        { name: "Scones", description: "Clotted cream and jam", price: 4.5, image: "/landing/en/scones.webp" },
        { name: "Victoria Sponge", description: "Strawberry jam and cream", price: 4, image: "/landing/en/victoria-sponge.webp" },
      ],
    },
  ],
  es: [
    {
      name: "Desayunos",
      items: [
        { name: "Churros con chocolate", description: "Recién hechos", price: 4.5, image: "/landing/es/churros.webp" },
        { name: "Pincho de tortilla", description: "Tortilla de patatas casera", price: 4, image: "/landing/es/tortilla.webp" },
        { name: "Café con leche", description: "En vaso, como debe ser", price: 1.8, image: "/landing/es/cafe-con-leche.webp" },
      ],
    },
    {
      name: "Tapas",
      items: [
        { name: "Patatas bravas", description: "Salsa brava y alioli", price: 5.5, image: "/landing/es/patatas-bravas.webp" },
        { name: "Croquetas de jamón", description: "Caseras, de jamón ibérico", price: 6.5, image: "/landing/es/croquetas.webp" },
      ],
    },
  ],
} satisfies Record<Locale, unknown>;

/** Category chips; the one at `active` is highlighted. */
const CATEGORIES: Record<Locale, { names: string[]; active: number }> = {
  tr: { names: ["Kahvaltı", "Sıcak İçecekler", "Tatlılar"], active: 1 },
  en: { names: ["Breakfast", "Hot Drinks", "Cakes & Bakes"], active: 1 },
  es: { names: ["Desayunos", "Bebidas", "Tapas"], active: 0 },
};

/** Landing hero illustration: the customer menu inside a phone frame. */
export async function PhoneMockup() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <div aria-hidden className="relative mx-auto w-[19rem] [zoom:0.7]">
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
            <p className="font-heading text-2xl font-bold">{DEMO_SHOPS[locale].name}</p>
            <p className="mt-1 text-[11px] opacity-60">{dict.menu.label}</p>
          </div>

          <div className="flex gap-1.5 overflow-hidden border-b px-4 py-2.5">
            {CATEGORIES[locale].names.map((category, i) => (
              <span
                key={category}
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] ${i === CATEGORIES[locale].active ? "bg-foreground text-background" : ""}`}
              >
                {category}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-4 px-4 pt-4">
            {SECTIONS[locale].map((section) => (
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
                      <span className="text-[13px] font-semibold tabular-nums">{formatPrice(item.price, locale, DEMO_SHOPS[locale].currency)}</span>
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
