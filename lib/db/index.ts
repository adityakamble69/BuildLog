import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and configure it."
  );
}

// Supabase's Transaction-mode connection pooler (port 6543) does not
// support prepared statements, so `prepare: false` is required here.
// See docs/database.md #15.
// Never import this file from a client component.
const client = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });
