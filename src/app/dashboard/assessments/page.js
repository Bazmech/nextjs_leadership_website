import Link from "@/components/atoms/Link/Link";
import LocalDateTime from "@/components/atoms/LocalDateTime/LocalDateTime";
import StartAssessmentForm from "@/components/organisms/StartAssessmentForm/StartAssessmentForm";
import {
  buildDefaultSubmissionTitle,
  formatFrequencyLabel,
  formatStatusLabel,
  listAssessmentsForUser,
} from "@/lib/assessments";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata() {
  return buildSimplePageMetadata(
    "Start an assessment",
    "Start a new leadership assessment or continue one in progress.",
  );
}

export default async function AssessmentsPage() {
  const { startable } = await listAssessmentsForUser();

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
              Start an assessment
            </h1>
            <p className="mt-3 text-lg text-muted">
              Start a new assessment or continue where you left off.
            </p>
          </div>
          <Link
            href="/dashboard/assessments/past"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            Past assessments
          </Link>
        </div>

        <div className="mt-10 space-y-4">
          {startable.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-muted">
                No assessments are available to start right now.
              </p>
            </div>
          ) : (
            startable.map(
              ({ assessment, canStart, inProgress, reason, nextAvailableAt }) => (
                <div
                  key={assessment.id}
                  className="rounded-2xl border border-border bg-surface p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {assessment.title}
                      </h3>
                      {assessment.description ? (
                        <p className="mt-1 text-sm text-muted">
                          {assessment.description}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted">
                        {formatStatusLabel(assessment.status)} ·{" "}
                        {formatFrequencyLabel(assessment.frequency)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    {inProgress ? (
                      <Link
                        href={`/dashboard/assessments/submissions/${inProgress.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-light"
                      >
                        Continue “{inProgress.title}”
                      </Link>
                    ) : (
                      <StartAssessmentForm
                        assessmentId={assessment.id}
                        defaultTitle={buildDefaultSubmissionTitle(
                          assessment.title,
                          assessment.frequency,
                        )}
                        disabled={!canStart}
                        disabledReason={
                          reason || nextAvailableAt ? (
                            <>
                              {reason}
                              {nextAvailableAt ? (
                                <>
                                  {" Next available "}
                                  <LocalDateTime value={nextAvailableAt} />.
                                </>
                              ) : null}
                            </>
                          ) : null
                        }
                      />
                    )}
                  </div>
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}
