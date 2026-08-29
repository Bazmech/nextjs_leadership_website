import Link from "@/components/atoms/Link/Link";
import LeadershipProfileRadar from "@/components/organisms/LeadershipProfileRadar/LeadershipProfileRadar";
import { getOverallAssessmentAverages } from "@/lib/assessments";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata() {
  return buildSimplePageMetadata(
    "Overall assessment average",
    "View stored overall domain and attribute averages from opted-in assessments.",
  );
}

export default async function AssessmentAveragePage() {
  const groups = await getOverallAssessmentAverages();

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
          Overall assessment average
        </h1>
        <p className="mt-3 text-lg text-muted">
          Domain averages and attribute averages are stored separately, using
          only completed submissions that have been opted in. Include or
          exclude your own completed assessments at any time.
        </p>

        <div className="mt-10 space-y-12">
          {groups.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-muted">
                No submissions are included yet. Open a completed assessment and
                check “Include in overall average”, or use the checkbox on{" "}
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
            groups.map(
              ({
                assessment,
                submissionCount,
                domainAverages,
                attributeAverages,
              }) => (
                <section key={assessment.id}>
                  <h2 className="text-xl font-semibold text-foreground">
                    {assessment.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Average of {submissionCount} included{" "}
                    {submissionCount === 1 ? "submission" : "submissions"}.
                  </p>
                  <div className="mt-6">
                    <LeadershipProfileRadar
                      assessment={assessment}
                      domainAverages={domainAverages}
                      attributeAverages={attributeAverages}
                      heading="Overall attribute average"
                      description="Attribute averages across every opted-in completed submission (scale 0–5)."
                      domainHeading="Overall domain average"
                      domainDescription="Domain averages across every opted-in completed submission (scale 0–5)."
                      attributeHeading="Overall attribute averages"
                    />
                  </div>
                </section>
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}
