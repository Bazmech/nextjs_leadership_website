import { notFound } from "next/navigation";
import Link from "@/components/atoms/Link/Link";
import DeleteSubmissionButton from "@/components/organisms/DeleteSubmissionButton/DeleteSubmissionButton";
import ExportSubmissionPdfButton from "@/components/organisms/ExportSubmissionPdfButton/ExportSubmissionPdfButton";
import RenameSubmissionTitle from "@/components/organisms/RenameSubmissionTitle/RenameSubmissionTitle";
import TakeAssessmentForm from "@/components/organisms/TakeAssessmentForm/TakeAssessmentForm";
import { getOwnedSubmission } from "@/lib/assessments";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const owned = await getOwnedSubmission(id);
  return buildSimplePageMetadata(
    owned?.submission.title ?? "Assessment",
    "View or complete your leadership assessment.",
  );
}

export default async function SubmissionPage({ params }) {
  const { id } = await params;
  const owned = await getOwnedSubmission(id);
  if (!owned) notFound();

  const { submission, assessment } = owned;
  const readOnly = submission.status === "completed";

  return (
    <div className="bg-background px-6 py-16">
      <div className={`mx-auto ${readOnly ? "max-w-5xl" : "max-w-3xl"}`}>
        <Link
          href={readOnly ? "/dashboard/assessments/past" : "/dashboard/assessments"}
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          {readOnly ? "← Past assessments" : "← Assessments"}
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <RenameSubmissionTitle
              submissionId={submission.id}
              title={submission.title}
            />
            <p className="mt-2 text-lg text-muted">
              Assessment: {assessment.title}
            </p>
            {readOnly ? (
              <p className="mt-2 text-sm text-muted">
                Completed assessment — attribute averages appear in the profile
                chart; statement scores are grouped by domain below.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Work through each domain. Progress saves automatically every 30
                seconds when something has changed.
              </p>
            )}
          </div>
          {readOnly ? (
            <ExportSubmissionPdfButton submissionId={submission.id} />
          ) : (
            <DeleteSubmissionButton submissionId={submission.id} />
          )}
        </div>

        <div className="mt-8">
          <TakeAssessmentForm
            submission={submission}
            assessment={assessment}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
}
