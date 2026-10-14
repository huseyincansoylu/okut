# Okut

**QR-code digital menus for cafés and restaurants.** Shop owners build their menu in a dashboard, print a QR table card, and customers scan it to see the live menu in their browser. No app to install, no sign-up.

The name comes from the Turkish word *okut*: "scan it". The whole app is available in **English, Turkish and Spanish**, and menus can be translated so tourists can read them too.

## Features

**For shop owners**
- **Menu management:** create categories and products with prices, descriptions and photos; edit or delete them inline.
- **Sold-out toggle:** mark an item as unavailable in one click (optimistic UI). It stays on the menu, greyed out with a "Sold out" badge.
- **Menu translations:** categories and products can store translations (the Okut Cafe demo ships with English text). Visitors reading another language get their translation, then English, then the original.
- **Shop settings:** rename the shop (the menu URL stays the same, so printed QR codes keep working), upload a logo and pick a header color with a live preview.
- **Currencies:** a shop's currency comes from the language it signs up in: Turkish → TRY, Spanish → EUR, English → GBP. Prices are formatted the way each visitor's language writes them ("£3.50", "3,50 €").
- **Photo uploads:** images are resized and converted to WebP in the browser before upload, so uploads stay small (~100–400 KB) even from a phone camera.
- **QR codes:** download the menu's QR code as PNG or SVG, or print a ready-made table card.
- **Overview dashboard:** menu stats, recently edited products, and a "menu health" check that flags products missing photos or descriptions.

**For customers**
- A fast, mobile-first public menu at `/menu/<shop-slug>`, with sticky category navigation.
- Tapping an item opens a bottom sheet with a large photo and the full description.
- Opens in the phone's language (English, Turkish or Spanish), with a language menu to switch.
- Served from cache and refreshed as soon as the owner changes something.

**Live demo:** [okut.vercel.app](https://okut.vercel.app). Scan the QR code on the landing page, or open the sample menu of **Okut Cafe** directly at [okut.vercel.app/menu/okut-cafe](https://okut.vercel.app/menu/okut-cafe). It's a read-only shop created by `pnpm db:seed` (5 categories, 20 products, 12 photos).

## Tech stack

| Area | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions, Cache Components), React 19, TypeScript |
| Backend | [Supabase](https://supabase.com): Auth, PostgreSQL, Storage |
| Database access | [Drizzle ORM](https://orm.drizzle.team) with SQL migrations |
| Validation | [Zod](https://zod.dev) |
| UI | [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com), [Lucide](https://lucide.dev) icons |
| QR codes | [qrcode](https://github.com/soldair/node-qrcode) |

## Architecture & security

- **Server-only data access.** Every query runs on the server through Drizzle. Row Level Security is enabled on every table with no policies, so the public Supabase Data API (anon/publishable key) cannot read or write any table.
- **Authorization in code.** Each Server Action resolves the signed-in user's shop and scopes every read and write to it (`requireUserId` → `getOwnedShop` → `shop_id` filters). A user can never touch another shop's data.
- **Input validation.** All form input is validated with Zod on the server, including Turkish-formatted prices (`1.250,50` → `1250.50`).
- **Secure uploads.** Photos are uploaded server-side with the Supabase secret key, only after the ownership check, with type (WebP/JPEG/PNG) and size (2 MB) limits enforced both in the app and on the storage bucket. Replaced or deleted photos are removed from storage.
- **Caching.** Public menus use Next.js `"use cache"` with per-shop cache tags; owner edits call `updateTag()`, so customers see changes immediately while unchanged menus are served from cache.
- **Internationalization.** Every page lives under `app/[lang]` (`/en`, `/tr`, `/es`) and is prerendered per language. `src/proxy.ts` sends unprefixed URLs, including printed QR codes, to the visitor's language (saved choice, then `Accept-Language`). Server Components read the language with `next/root-params`; Server Actions use a cookie the proxy keeps in sync. Dictionaries are typed against the English source, so a missing key in any language is a compile error.
- **Session handling.** The proxy also refreshes the Supabase session on each request and protects `/[lang]/dashboard`. Public menu routes skip it entirely.
- **Read-only demo.** The demo shop has no owner (`owner_id` is `NULL`). No account can resolve it as "their" shop, so it cannot be edited through the app.

## Project structure

```
src/
├── app/
│   ├── [lang]/                 # Every page, per language (en, tr, es)
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Owner dashboard: overview, menu editor, QR codes, settings
│   │   └── menu/[slug]/        # Public, cached customer menu
│   └── auth/                   # Sign-in / sign-up Server Actions, email confirmation
├── components/                 # Auth dialog, language switch and shadcn/ui primitives
├── db/                         # Drizzle schema and client
├── i18n/                       # Locales, typed dictionaries, server/client helpers
└── lib/                        # Auth, storage, caching, QR and formatting helpers
drizzle/                        # SQL migrations
scripts/                        # Demo menu seed script and photos
```

## Getting started

**Requirements:** Node.js 20+, pnpm, and a free [Supabase](https://supabase.com) project.

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the values from your Supabase dashboard (**Connect** and **Project Settings → API Keys**). `SUPABASE_SECRET_KEY` is used on the server only and must never be exposed to the browser.
3. **Run the database migrations.** This creates the tables and the `menu-images` storage bucket.
   ```bash
   pnpm db:migrate
   ```
4. **(Optional) Seed the demo menu**
   ```bash
   pnpm db:seed
   ```
5. **Start the development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` / `pnpm start` | Build and run the production app |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Generate route types and run the TypeScript compiler |
| `pnpm db:generate` | Generate a migration from schema changes |
| `pnpm db:migrate` | Apply migrations to the database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Create or refresh the read-only demo menu |

## Credits

Demo menu photos are from [Unsplash](https://unsplash.com), used under the [Unsplash License](https://unsplash.com/license). Photographers are credited in [`scripts/demo-images/CREDITS.md`](scripts/demo-images/CREDITS.md).
