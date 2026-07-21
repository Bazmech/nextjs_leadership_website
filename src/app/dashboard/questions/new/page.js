import Link from "@/components/atoms/Link/Link";
import CreateAssessmentForm from "@/components/organisms/CreateAssessmentForm/CreateAssessmentForm";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata() {
  return buildSimplePageMetadata(
    "New assessment",
    "Create a leadership assessment template.",
  );
}

export default function NewAssessmentPage() {
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
          New assessment
        </h1>
        <p className="mt-3 text-lg text-muted">
          Set the title, status, and how often users can start a new
          submission. Add domains and statements next.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <CreateAssessmentForm />
        </div>
      </div>
    </div>
  );
}
