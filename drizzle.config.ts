import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  entities: { roles: { provider: "supabase" } },
  dbCredentials: {
    // Use the direct / session connection (port 5432) for migrations.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});
