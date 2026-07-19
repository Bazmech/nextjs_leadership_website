import Link from "@/components/atoms/Link/Link";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata() {
  return buildSimplePageMetadata(
    "Questions",
    "Manage coaching and assessment questions.",
  );
}

export default function QuestionsPage() {
  return (
    <div className="bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
          Questions
        </h1>
        <p className="mt-3 text-lg text-muted">
          Create and manage questions used across coaching and assessment flows.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted">
            No questions yet. Add questions here when you are ready to build the
            catalog.
          </p>
        </div>
      </div>
    </div>
  );
}
