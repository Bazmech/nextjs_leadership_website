import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../src/db/migrations");

async function runMigrations() {
  const databaseUrl =
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn("Skipping migrations: DATABASE_URL is not set.");
    return;
  }

  const gitBranch = process.env.VERCEL_GIT_COMMIT_REF ?? "local";
  const vercelEnv = process.env.VERCEL_ENV ?? "local";

  console.log(`Running migrations (${vercelEnv}, git: ${gitBranch})...`);

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder });

  console.log("Migrations complete.");
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
