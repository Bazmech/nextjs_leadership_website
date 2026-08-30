import { execSync } from "node:child_process";

function getGitBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
    }).trim();
  } catch {
    return "local";
  }
}

function toNeonBranchName(gitBranch) {
  return gitBranch.replace(/[^a-zA-Z0-9/_-]/g, "-").slice(0, 63);
}

const gitBranch = getGitBranch();
const neonBranch = toNeonBranchName(gitBranch);

console.log("Neon per-branch development");
console.log("---------------------------");
console.log(`Git branch:   ${gitBranch}`);
console.log(`Neon branch:  ${neonBranch}`);
console.log("");
console.log("Vercel preview deployments get an isolated Neon branch automatically");
console.log("when Preview branching is enabled in Storage → Deployments Configuration.");
console.log("");
console.log("For local per-branch development:");
console.log(`  1. Create a Neon branch: neon branches create --name ${neonBranch}`);
console.log("  2. Copy that branch connection string into .env.local as DATABASE_URL");
console.log("  3. Run: yarn db:migrate");
