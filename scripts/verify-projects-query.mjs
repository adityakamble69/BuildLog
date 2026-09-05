import nextEnv from "@next/env";
import postgres from "postgres";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("NO_URL");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });

try {
  const rows = await sql`
    select "id", "user_id", "name", "description", "status", "tags",
           "github_repository_id", "github_repository_owner",
           "github_repository_name", "github_repository_url",
           "github_default_branch", "github_last_synced_at",
           "created_at", "updated_at"
    from "projects"
    where "projects"."user_id" = ${"user_3ItXqD42FxKhM0ULHRdQ8OWHMJ3"}
    order by "projects"."created_at" desc
  `;
  console.log(JSON.stringify({ ok: true, count: rows.length }));
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
