import { currentUser } from "@clerk/nextjs/server";
import { getRecentInquiries } from "@/actions/inquiry";
import Link from "@/components/atoms/Link/Link";
import { getDatabaseContext } from "@/lib/db-context";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";
import { getCurrentAppUser, isStaffRole } from "@/lib/users";

export async function generateMetadata() {
  return buildSimplePageMetadata("Dashboard", "Your leadership coaching dashboard.");
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export default async function DashboardPage() {
  const [user, appUser, inquiries] = await Promise.all([
    currentUser(),
    getCurrentAppUser(),
    getRecentInquiries(),
  ]);
  const showDbBranch = isStaffRole(appUser?.roleName);
  const dbContext = showDbBranch ? await getDatabaseContext() : null;

  return (
    <div className="bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
          {user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-3 text-lg text-muted">
          This protected route is available only to signed-in users. Use it for
          coaching resources, session notes, and program progress.
        </p>

        {showDbBranch ? (
          <p className="mt-6">
            <Link
              href="/dashboard/users"
              className="text-sm font-medium text-primary transition-colors hover:text-primary-light"
            >
              Manage users
            </Link>
          </p>
        ) : null}

        {showDbBranch && dbContext ? (
          <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Database branch
            </h2>
            <p className="mt-2 text-sm text-muted">
              Each Vercel preview deployment uses its own isolated Neon branch.
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Connection</dt>
                <dd className="font-medium text-foreground">
                  {dbContext.connected ? "Connected" : "Not configured"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Neon branch</dt>
                <dd className="font-medium text-foreground">
                  {dbContext.neonBranch ?? "—"}
                </dd>
              </div>
              {dbContext.neonBranchId &&
              dbContext.neonBranch !== dbContext.neonBranchId ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Neon branch ID</dt>
                  <dd className="font-medium text-foreground">
                    {dbContext.neonBranchId}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Git branch</dt>
                <dd className="font-medium text-foreground">
                  {dbContext.gitBranch ?? "local"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Environment</dt>
                <dd className="font-medium text-foreground">
                  {dbContext.vercelEnv}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <div
          className={`${showDbBranch ? "mt-6" : "mt-10"} rounded-2xl border border-border bg-surface p-6`}
        >
          <h2 className="text-lg font-semibold text-foreground">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Email</dt>
              <dd className="font-medium text-foreground">
                {user?.emailAddresses[0]?.emailAddress ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Member since</dt>
              <dd className="font-medium text-foreground">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>

        {inquiries.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Your recent inquiries
            </h2>
            <ul className="mt-4 space-y-4">
              {inquiries.map((inquiry) => (
                <li
                  key={inquiry.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <p className="text-sm font-medium text-foreground">
                    {inquiry.message}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Submitted {formatDate(inquiry.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
