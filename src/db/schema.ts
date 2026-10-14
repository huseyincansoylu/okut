import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

/**
 * Optional translations of a row's text, keyed by language. The row's own columns
 * hold the original (shop's) text; menus fall back to it when a translation is missing.
 */
export type Translations = Partial<Record<"en" | "tr" | "es", { name?: string; description?: string }>>;

const translations = jsonb("translations").$type<Translations>().notNull().default({});

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

// RLS is enabled with no policies: the Supabase Data API (anon/authenticated keys)
// cannot touch these tables. All reads/writes go through Drizzle on the server,
// where ownership is checked in code.

export const shops = pgTable(
  "shops",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Null for showcase shops (e.g. the demo menu): no account owns them, so no one can edit them.
    ownerId: uuid("owner_id").references(() => authUsers.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logoUrl: text("logo_url"),
    // Key of a preset from src/lib/menu-themes.ts; unknown keys fall back to the default.
    theme: text("theme").notNull().default("sage"),
    // ISO 4217 code from src/lib/currency.ts. Changing it doesn't convert prices.
    currency: text("currency").notNull().default("TRY"),
    // Language the owner writes the menu in (a locale from src/i18n/config.ts);
    // translations cover the other languages.
    menuLanguage: text("menu_language").notNull().default("tr"),
    // Optional guest Wi-Fi shown on the public menu; anyone with the menu link can see it.
    wifiName: text("wifi_name"),
    wifiPassword: text("wifi_password"),
    ...timestamps,
  },
  (t) => [uniqueIndex("shops_slug_idx").on(t.slug), index("shops_owner_idx").on(t.ownerId)],
).enableRLS();

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    translations,
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("categories_shop_idx").on(t.shopId)],
).enableRLS();

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    translations,
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    imageUrl: text("image_url"),
    isAvailable: boolean("is_available").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("products_category_idx").on(t.categoryId)],
).enableRLS();

export type Shop = typeof shops.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
