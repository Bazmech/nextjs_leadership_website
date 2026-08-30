import { neon } from "@neondatabase/serverless";

async function getNeonBranchId(databaseUrl) {
  const sql = neon(databaseUrl);
  const rows = await sql`
    SELECT current_setting('neon.branch_id', true) AS branch_id
  `;

  return rows[0]?.branch_id ?? null;
}

async function resolveNeonBranchName(branchId) {
  const projectId = process.env.NEON_PROJECT_ID;
  const apiKey = process.env.NEON_API_KEY;

  if (!branchId || !projectId || !apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return payload?.branch?.name ?? null;
  } catch {
    return null;
  }
}

export async function getDatabaseContext() {
  const gitBranch = process.env.VERCEL_GIT_COMMIT_REF ?? null;
  const vercelEnv = process.env.VERCEL_ENV ?? "local";
  const deploymentUrl = process.env.VERCEL_URL ?? null;

  if (!process.env.DATABASE_URL) {
    return {
      connected: false,
      gitBranch,
      vercelEnv,
      neonBranch: null,
      neonBranchId: null,
      deploymentUrl,
    };
  }

  try {
    const neonBranchId = await getNeonBranchId(process.env.DATABASE_URL);
    const neonBranchName = await resolveNeonBranchName(neonBranchId);

    return {
      connected: true,
      gitBranch,
      vercelEnv,
      neonBranch: neonBranchName ?? neonBranchId ?? "unknown",
      neonBranchId,
      deploymentUrl,
    };
  } catch {
    return {
      connected: true,
      gitBranch,
      vercelEnv,
      neonBranch: "unknown",
      neonBranchId: null,
      deploymentUrl,
    };
  }
}
