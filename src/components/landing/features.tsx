import { ArrowRightIcon, CheckIcon, CircleSlashIcon, CopyIcon, GripVerticalIcon, ImageOffIcon, PrinterIcon, TextIcon, WifiIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { DemoQrCode } from "@/components/demo-qr";
import { LogoMark } from "@/components/logo";
import { DEMO_SHOP } from "@/lib/demo";
import { dict, fill, plural } from "@/lib/dictionary";
import { formatPrice } from "@/lib/format";
import { MENU_THEMES } from "@/lib/menu-themes";
import { SoldOutDemo } from "./sold-out-demo";

const t = dict.landing;

/** A bento tile: an illustration on a dotted stage above a title and text. */
function Tile({ title, text, className = "", children }: { title: string; text: string; className?: string; children: ReactNode }) {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-border/70 transition-shadow hover:shadow-xl hover:shadow-foreground/5 ${className}`}
    >
      <div className="relative flex min-h-52 flex-1 items-center justify-center overflow-hidden bg-muted/60 p-6">
        <div className="absolute inset-0 bg-dots opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative flex w-full justify-center">{children}</div>
      </div>
      <div className="p-6">
        <h3 className="font-heading text-lg font-bold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </article>
  );
}

const EDITOR_ROWS = [
  { name: "English Breakfast Tea", price: 2.8 },
  { name: "Flat White", price: 3.4, editing: true },
  { name: "Hot Chocolate", price: 3.5 },
];

function EditorMock() {
  return (
    <div className="relative w-full max-w-md">
      <div className="rounded-2xl bg-card p-2 shadow-lg shadow-foreground/5 ring-1 ring-border/70">
        <p className="px-2.5 pt-1.5 pb-2 font-heading text-sm font-bold">Hot Drinks</p>
        <ul className="flex flex-col gap-1">
          {EDITOR_ROWS.map((row) => (
            <li
              key={row.name}
              className={`flex items-center gap-2 rounded-xl px-2 py-2 text-sm ${row.editing ? "bg-brand-tint ring-1 ring-primary/30" : ""}`}
            >
              <GripVerticalIcon className="size-4 text-muted-foreground/60" />
              <span className="flex-1 truncate font-medium">{row.name}</span>
              {row.editing ? (
                <span className="flex items-center gap-1.5 rounded-md bg-card px-2 py-0.5 tabular-nums ring-2 ring-primary/50">
                  {formatPrice(row.price)}
                  <span className="h-3.5 w-px bg-foreground motion-safe:animate-pulse" />
                </span>
              ) : (
                <span className="text-muted-foreground tabular-nums">{formatPrice(row.price)}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <span className="absolute -top-3 -right-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-md sm:-right-4">
        <CheckIcon className="size-3.5" />
        {t.mock.saved}
      </span>
    </div>
  );
}

function PhotoMock() {
  return (
    <div className="flex items-center gap-3">
      <figure className="flex flex-col items-center gap-2">
        <Image src="/landing/scones.webp" alt="" width={88} height={88} className="size-22 rounded-2xl object-cover blur-[1px] grayscale-[30%]" />
        <figcaption className="text-[11px] text-muted-foreground">{t.mock.original}</figcaption>
      </figure>
      <ArrowRightIcon className="size-4 shrink-0 text-primary" />
      <figure className="flex flex-col items-center gap-2">
        <Image src="/landing/scones.webp" alt="" width={88} height={88} className="size-22 rounded-2xl object-cover shadow-lg ring-2 ring-primary/40" />
        <figcaption className="text-[11px] font-medium text-primary">{t.mock.optimised}</figcaption>
      </figure>
    </div>
  );
}

function BrandMock() {
  const themes = Object.values(MENU_THEMES);
  return (
    <div className="flex w-full max-w-56 flex-col gap-3">
      <div className="flex flex-col items-center gap-1 rounded-2xl bg-emerald-50 py-4 shadow-sm ring-1 ring-border/70 dark:bg-emerald-950/40">
        <span className="flex size-8 items-center justify-center rounded-full bg-card ring-1 ring-border">
          <LogoMark className="size-4 text-primary" />
        </span>
        <span className="font-heading text-sm font-bold">{DEMO_SHOP.name}</span>
      </div>
      <div className="flex justify-center gap-2">
        {themes.map((theme, i) => (
          <span
            key={theme.swatch}
            className={`size-6 rounded-full ring-1 ring-foreground/10 ${theme.swatch} ${i === 0 ? "ring-2 ring-primary ring-offset-2 ring-offset-muted" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

function QrMock() {
  return (
    <div className="flex -rotate-3 flex-col items-center gap-2 rounded-2xl bg-white px-5 pt-4 pb-3 text-black shadow-xl ring-1 ring-black/5 transition-transform duration-500 group-hover:rotate-0">
      <span className="font-heading text-xs font-bold">{DEMO_SHOP.name}</span>
      <DemoQrCode className="size-24 p-0!" />
      <span className="flex items-center gap-1 text-[10px] text-black/60">
        <PrinterIcon className="size-3" />
        {t.mock.tableCard}
      </span>
    </div>
  );
}

function WifiMock() {
  return (
    <div className="w-full max-w-64 rounded-2xl bg-card p-4 shadow-lg shadow-foreground/5 ring-1 ring-border/70">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-brand-tint text-primary">
          <WifiIcon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">OkutCafe-Guest</p>
          <p className="text-xs text-muted-foreground">{dict.menu.wifiPassword}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-muted px-3 py-2 font-mono text-sm">
        flatwhite2026
        <CopyIcon className="size-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

function HealthMock() {
  const o = dict.dashboard.overview;
  const rows = [
    { icon: ImageOffIcon, text: plural(o.missingPhotos, 2) },
    { icon: TextIcon, text: plural(o.missingDescriptions, 3) },
    { icon: CircleSlashIcon, text: fill(o.soldOutList, { items: "Scones" }) },
  ];
  return (
    <ul className="flex w-full max-w-64 flex-col gap-2">
      {rows.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-2.5 rounded-xl bg-card px-3 py-2.5 text-sm shadow-sm ring-1 ring-border/70">
          <Icon className="size-4 shrink-0 text-brand-amber" />
          {text}
        </li>
      ))}
    </ul>
  );
}

/** Landing page features as a bento grid of small product illustrations. */
export function Features() {
  const f = t.features;
  return (
    <div className="grid gap-4 md:grid-cols-6">
      <Tile {...f.editor} className="md:col-span-4">
        <EditorMock />
      </Tile>
      <Tile {...f.soldOut} className="md:col-span-2">
        <SoldOutDemo />
      </Tile>
      <Tile {...f.photos} className="md:col-span-2">
        <PhotoMock />
      </Tile>
      <Tile {...f.brand} className="md:col-span-2">
        <BrandMock />
      </Tile>
      <Tile {...f.qr} className="md:col-span-2">
        <QrMock />
      </Tile>
      <Tile {...f.wifi} className="md:col-span-3">
        <WifiMock />
      </Tile>
      <Tile {...f.health} className="md:col-span-3">
        <HealthMock />
      </Tile>
    </div>
  );
}
