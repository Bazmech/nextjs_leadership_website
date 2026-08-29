import Link from "@/components/atoms/Link/Link";
import LeadershipProfileRadar from "@/components/organisms/LeadershipProfileRadar/LeadershipProfileRadar";
import { getOwnedAssessmentAverages } from "@/lib/assessments";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata() {
  return buildSimplePageMetadata(
    "Assessment average",
    "View the average of the assessments you have chosen to include.",
  );
}

export default async function AssessmentAveragePage() {
  const groups = await getOwnedAssessmentAverages();

  return (
    <div className="bg-background px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/assessments/past"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Past assessments
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
          Assessment average
        </h1>
        <p className="mt-3 text-lg text-muted">
          Averages are calculated from completed submissions you have opted in.
          You can include or exclude any past assessment at any time.
        </p>

        <div className="mt-10 space-y-12">
          {groups.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-muted">
                No submissions are included yet. Open a completed assessment and
                check “Include in assessment average”, or use the checkbox on{" "}
                <Link
                  href="/dashboard/assessments/past"
                  className="font-medium text-primary underline decoration-primary/30 underline-offset-4"
                >
                  Past assessments
                </Link>
                .
              </p>
            </div>
          ) : (
            groups.map(({ assessment, submissions, answers }) => (
              <section key={assessment.id}>
                <h2 className="text-xl font-semibold text-foreground">
                  {assessment.title}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Average of {submissions.length} included{" "}
                  {submissions.length === 1 ? "submission" : "submissions"}.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {submissions.map((submission) => (
                    <li key={submission.id}>
                      <Link
                        href={`/dashboard/assessments/submissions/${submission.id}`}
                        className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
                      >
                        {submission.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <LeadershipProfileRadar
                    assessment={assessment}
                    answers={answers}
                    heading="Average leadership profile"
                    description="Attribute averages across the included submissions (scale 0–5)."
                  />
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
