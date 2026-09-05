import { defineConfig } from "drizzle-kit";

// drizzle-kit runs migrations over a direct, non-pooled connection.
// Supabase's Transaction-mode pooler is not suitable for migration
// sessions — see docs/database.md #15.
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DIRECT_URL (or DATABASE_URL) is not set. Copy .env.example to .env.local and configure it."
  );
}

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
  verbose: true,
});
