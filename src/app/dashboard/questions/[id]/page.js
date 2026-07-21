import { notFound } from "next/navigation";
import Link from "@/components/atoms/Link/Link";
import AssessmentStructureBuilder from "@/components/organisms/AssessmentStructureBuilder/AssessmentStructureBuilder";
import EditAssessmentMetaForm from "@/components/organisms/EditAssessmentMetaForm/EditAssessmentMetaForm";
import {
  countStatementsInTree,
  getAssessmentTree,
} from "@/lib/assessments";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const assessment = await getAssessmentTree(id);
  return buildSimplePageMetadata(
    assessment?.title ?? "Assessment",
    "Edit assessment template structure and settings.",
  );
}

export default async function EditAssessmentPage({ params }) {
  const { id } = await params;
  const assessment = await getAssessmentTree(id);
  if (!assessment) notFound();

  const statementCount = countStatementsInTree(assessment);

  return (
    <div className="bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/questions"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Assessments
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
          {assessment.title}
        </h1>
        <p className="mt-3 text-lg text-muted">
          {statementCount} statement{statementCount === 1 ? "" : "s"} across{" "}
          {assessment.domains.length} domain
          {assessment.domains.length === 1 ? "" : "s"}.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <div className="mt-5">
            <EditAssessmentMetaForm assessment={assessment} />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">Structure</h2>
          <p className="mt-1 text-sm text-muted">
            Domains contain attributes; attributes contain statements scored
            1–5.
          </p>
          <div className="mt-5">
            <AssessmentStructureBuilder assessment={assessment} />
          </div>
        </div>
      </div>
    </div>
  );
}
