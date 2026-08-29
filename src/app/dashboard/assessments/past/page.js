import Link from "@/components/atoms/Link/Link";
import LocalDateTime from "@/components/atoms/LocalDateTime/LocalDateTime";
import DomainAveragesLineChart from "@/components/organisms/DomainAveragesLineChart/DomainAveragesLineChart";
import IncludeInAverageCheckbox from "@/components/organisms/IncludeInAverageCheckbox/IncludeInAverageCheckbox";
import { getPastAssessmentsPageData } from "@/lib/assessments";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata() {
  return buildSimplePageMetadata(
    "Past assessments",
    "Review your previous leadership assessment submissions.",
  );
}

export default async function PastAssessmentsPage() {
  const { past, domainSeries = [], attributeSeries = [] } =
    await getPastAssessmentsPageData();

  return (
    <div className="bg-background px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Dashboard
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Past assessments
            </h1>
            <p className="mt-3 text-lg text-muted">
              Your previous submissions. Completed assessments can be included
              in the overall domain and attribute averages.
            </p>
          </div>
          <Link
            href="/dashboard/assessments/average"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            Overall average
          </Link>
        </div>

        {domainSeries.length > 0 || attributeSeries.length > 0 ? (
          <div className="mt-10 grid gap-8">
            {domainSeries.length > 0 ? (
              <DomainAveragesLineChart groups={domainSeries} />
            ) : null}
            {attributeSeries.length > 0 ? (
              <DomainAveragesLineChart
                groups={attributeSeries}
                heading="Attribute averages"
                description="Each line is an attribute. Each point is a completed assessment (scale 0–5)."
                idPrefix="attribute-trend"
              />
            ) : null}
          </div>
        ) : null}

        <div className="mt-10 space-y-3">
          {past.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-muted">
                You have not started any assessments yet.
              </p>
            </div>
          ) : (
            past.map(({ submission, assessment }) => (
              <div
                key={submission.id}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <Link
                    href={`/dashboard/assessments/submissions/${submission.id}`}
                    className="min-w-0 flex-1 transition-colors hover:text-primary"
                  >
                    <h3 className="text-base font-semibold text-foreground">
                      {submission.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      Assessment: {assessment?.title ?? "—"}
                    </p>
                  </Link>
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                    {submission.status === "completed"
                      ? "Completed"
                      : "In progress"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted">
                    Started <LocalDateTime value={submission.startedAt} />
                    {submission.completedAt ? (
                      <>
                        {" · Completed "}
                        <LocalDateTime value={submission.completedAt} />
                      </>
                    ) : null}
                  </p>
                  {submission.status === "completed" ? (
                    <IncludeInAverageCheckbox
                      submissionId={submission.id}
                      includeInAverage={submission.includeInAverage}
                      compact
                    />
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
