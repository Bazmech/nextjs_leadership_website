import Link from "@/components/atoms/Link/Link";
import LocalDateTime from "@/components/atoms/LocalDateTime/LocalDateTime";
import { listAssessmentsForUser } from "@/lib/assessments";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata() {
  return buildSimplePageMetadata(
    "Past assessments",
    "Review your previous leadership assessment submissions.",
  );
}

export default async function PastAssessmentsPage() {
  const { past } = await listAssessmentsForUser();

  return (
    <div className="bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/assessments"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Assessments
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
          Past assessments
        </h1>
        <p className="mt-3 text-lg text-muted">
          Your previous submissions, including any still in progress.
        </p>

        <div className="mt-10 space-y-3">
          {past.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-muted">
                You have not started any assessments yet.
              </p>
            </div>
          ) : (
            past.map(({ submission, assessment }) => (
              <Link
                key={submission.id}
                href={`/dashboard/assessments/submissions/${submission.id}`}
                className="block rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {submission.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      Assessment: {assessment?.title ?? "—"}
                    </p>
                  </div>
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                    {submission.status === "completed"
                      ? "Completed"
                      : "In progress"}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted">
                  Started <LocalDateTime value={submission.startedAt} />
                  {submission.completedAt ? (
                    <>
                      {" · Completed "}
                      <LocalDateTime value={submission.completedAt} />
                    </>
                  ) : null}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
