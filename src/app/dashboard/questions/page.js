import Link from "@/components/atoms/Link/Link";
import LocalDateTime from "@/components/atoms/LocalDateTime/LocalDateTime";
import {
  formatFrequencyLabel,
  formatStatusLabel,
  listAllAssessments,
} from "@/lib/assessments";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata() {
  return buildSimplePageMetadata(
    "Assessments",
    "Create and manage leadership assessment templates.",
  );
}

export default async function QuestionsPage() {
  const rows = await listAllAssessments();

  return (
    <div className="bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Dashboard
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Assessments
            </h1>
            <p className="mt-3 text-lg text-muted">
              Build assessment templates with domains, attributes, and
              statements.
            </p>
          </div>
          <Link
            href="/dashboard/questions/new"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-light"
          >
            New assessment
          </Link>
        </div>

        <div className="mt-10 space-y-3">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-muted">
                No assessments yet. Create one to define domains, attributes,
                and scored statements.
              </p>
            </div>
          ) : (
            rows.map((assessment) => (
              <Link
                key={assessment.id}
                href={`/dashboard/questions/${assessment.id}`}
                className="block rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {assessment.title}
                    </h2>
                    {assessment.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">
                        {assessment.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                    {formatStatusLabel(assessment.status)}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted">
                  {formatFrequencyLabel(assessment.frequency)} · Updated{" "}
                  <LocalDateTime value={assessment.updatedAt} />
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
