import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Connect Neon via Vercel Storage or add it to .env.local.",
    );
  }

  return url;
}

export function getDb() {
  const sql = neon(getDatabaseUrl());
  return drizzle(sql, { schema });
}
