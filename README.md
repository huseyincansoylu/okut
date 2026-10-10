# Dijital Menü

Dükkanların menü oluşturup kategori, ürün, fiyat ve fotoğraf ekleyebildiği; menüyü QR kod ile paylaşabildiği web uygulaması.

## Teknolojiler

- **Next.js 16** (App Router, Server Actions, Cache Components) + TypeScript
- **Supabase**: kimlik doğrulama (Auth), PostgreSQL, fotoğraf depolama (Storage)
- **Drizzle ORM**: şema, migration ve tip güvenli sorgular
- **Tailwind CSS**

## Mimari notlar

- Tüm veritabanı erişimi sunucuda Drizzle ile yapılır. Tablolarda RLS açık ve politika yok; böylece Supabase Data API (anon key) tablolara erişemez.
- Yetki kontrolü uygulama kodunda yapılır (`src/lib/auth.ts` → `requireUserId`, sorgularda `owner_id` filtresi).
- `src/proxy.ts` her istekte Supabase oturumunu yeniler ve `/dashboard` altını korur. `/menu/*` sayfaları herkese açıktır.

## Kurulum

1. [Supabase](https://supabase.com) üzerinde bir proje oluşturun.
2. Ortam değişkenlerini ayarlayın:
   ```bash
   cp .env.example .env.local
   ```
   Değerleri Supabase panelindeki **Connect** ve **Project Settings → API** bölümlerinden doldurun.
3. Paketleri kurup migration'ları uygulayın:
   ```bash
   pnpm install
   pnpm db:migrate
   ```
4. Geliştirme sunucusunu başlatın:
   ```bash
   pnpm dev
   ```

## Demo

`pnpm db:seed` giriş yapılabilir bir demo hesabı ve 20 ürünlü "Demo Kafe" menüsü oluşturur (`/menu/demo-kafe`).
Hesap bilgileri `scripts/seed-demo.mts` dosyasının başında; `.env.local` içinde `DEMO_EMAIL` / `DEMO_PASSWORD` ile değiştirilebilir.

## Komutlar

| Komut | Açıklama |
|---|---|
| `pnpm dev` | Geliştirme sunucusu |
| `pnpm build` | Production derlemesi |
| `pnpm lint` / `pnpm typecheck` | Lint ve tip kontrolü |
| `pnpm db:generate` | Şema değişikliğinden migration üretir |
| `pnpm db:migrate` | Migration'ları veritabanına uygular |
| `pnpm db:studio` | Drizzle Studio (veritabanı arayüzü) |
| `pnpm db:seed` | Demo hesabı ve örnek menüyü oluşturur |
