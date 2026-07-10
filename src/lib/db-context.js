import { neon } from "@neondatabase/serverless";

export async function getDatabaseContext() {
  const gitBranch = process.env.VERCEL_GIT_COMMIT_REF ?? null;
  const vercelEnv = process.env.VERCEL_ENV ?? "local";

  if (!process.env.DATABASE_URL) {
    return {
      connected: false,
      gitBranch,
      vercelEnv,
      neonBranch: null,
      deploymentUrl: process.env.VERCEL_URL ?? null,
    };
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT name AS branch_name
      FROM neon.branches
      WHERE id = current_setting('neon.branch_id')::uuid
    `;

    return {
      connected: true,
      gitBranch,
      vercelEnv,
      neonBranch: rows[0]?.branch_name ?? "unknown",
      deploymentUrl: process.env.VERCEL_URL ?? null,
    };
  } catch {
    return {
      connected: true,
      gitBranch,
      vercelEnv,
      neonBranch: "unknown",
      deploymentUrl: process.env.VERCEL_URL ?? null,
    };
  }
}
