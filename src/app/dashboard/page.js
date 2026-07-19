import { isFilled } from "@prismicio/client";
import { currentUser } from "@clerk/nextjs/server";
import Link from "@/components/atoms/Link/Link";
import DangerZone from "@/components/molecules/DangerZone/DangerZone";
import ManageAccountButton from "@/components/molecules/ManageAccountButton/ManageAccountButton";
import RichText from "@/components/molecules/RichText/RichText";
import { getDatabaseContext } from "@/lib/db-context";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";
import { getSiteSettings } from "@/lib/prismic-settings";
import {
  getCurrentAppUser,
  isStaffRole,
  isSuperAdminRole,
} from "@/lib/users";

export async function generateMetadata() {
  return buildSimplePageMetadata("Dashboard", "Your leadership coaching dashboard.");
}

function StartAssessmentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}

function PastAssessmentsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

export default async function DashboardPage() {
  const [user, appUser, settings] = await Promise.all([
    currentUser(),
    getCurrentAppUser(),
    getSiteSettings(),
  ]);
  const showStaffTools = isStaffRole(appUser?.roleName);
  const showSuperAdminTools = isSuperAdminRole(appUser?.roleName);
  const dbContext = showSuperAdminTools ? await getDatabaseContext() : null;
  return (
    <div className="bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
          {user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        {isFilled.richText(settings.introductionText) ? (
          <RichText
            field={settings.introductionText}
            className="mt-3 text-lg [&_p]:text-lg"
          />
        ) : null}

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">Assessments</h2>
          <div className="mt-4 flex flex-col gap-3">
            <Link className="inline-flex items-center gap-2.5 font-medium text-primary transition-colors hover:text-primary-light">
              <StartAssessmentIcon />
              <span className="underline decoration-primary/30 underline-offset-4">
                Start Assessment
              </span>
            </Link>
            <Link className="inline-flex items-center gap-2.5 font-medium text-primary transition-colors hover:text-primary-light">
              <PastAssessmentsIcon />
              <span className="underline decoration-primary/30 underline-offset-4">
                Past Assessments (3)
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h2 className="text-lg font-semibold text-foreground">Account</h2>
            <ManageAccountButton />
          </div>
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

        {showStaffTools ? (
          <DangerZone className="mt-6">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Manage users
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Change roles and enable or disable accounts.
                  </p>
                </div>
                <Link
                  href="/dashboard/users"
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                >
                  Manage users
                </Link>
              </div>

              {showSuperAdminTools ? (
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-red-200 pt-5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Manage questions
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Create and edit coaching and assessment questions.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/questions"
                    className="inline-flex shrink-0 items-center justify-center rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                  >
                    Manage questions
                  </Link>
                </div>
              ) : null}

              {showSuperAdminTools && dbContext ? (
                <div className="border-t border-red-200 pt-5">
                  <p className="text-sm font-medium text-foreground">
                    Database branch
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Each Vercel preview deployment uses its own isolated Neon
                    branch.
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
            </div>
          </DangerZone>
        ) : null}
      </div>
    </div>
  );
}
