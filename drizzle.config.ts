import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// drizzle-kit is a standalone CLI — it does NOT read .env.local the
// way `next dev`/`next build` do. Load env files the same way Next.js
// does (.env.local, .env.development, .env, in that precedence) so
// `npx drizzle-kit generate` works without extra tooling.
loadEnvConfig(process.cwd());

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
