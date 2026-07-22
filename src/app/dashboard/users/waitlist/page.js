import Link from "@/components/atoms/Link/Link";
import WaitlistManager from "@/components/organisms/WaitlistManager/WaitlistManager";
import WaitlistSearchForm from "@/components/organisms/WaitlistSearchForm/WaitlistSearchForm";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";
import { listWaitlistEntries } from "@/lib/users";

export async function generateMetadata() {
  return buildSimplePageMetadata(
    "Wait list",
    "Review and accept or deny people on the Clerk login wait list.",
  );
}

function buildPageHref(page, query) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/dashboard/users/waitlist?${qs}` : "/dashboard/users/waitlist";
}

export default async function WaitlistPage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const pageRaw = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const { entries, totalCount, totalPages, page: currentPage } =
    await listWaitlistEntries({ query, page });

  return (
    <div className="bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/users"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Users
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
          Wait list
        </h1>
        <p className="mt-3 text-lg text-muted">
          Accept or deny pending Clerk wait list entries. Clerk stores email
          only on the wait list (no name until they create an account).
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <WaitlistSearchForm initialQuery={query} />

          <p className="mt-4 text-sm text-muted">
            {totalCount === 0
              ? "No pending entries."
              : `${totalCount} pending ${totalCount === 1 ? "entry" : "entries"}`}
            {query.trim() ? ` matching “${query.trim()}”` : ""}.
          </p>

          <WaitlistManager entries={entries} />

          {totalPages > 1 ? (
            <nav
              className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
              aria-label="Wait list pagination"
            >
              <p className="text-sm text-muted">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={buildPageHref(currentPage - 1, query.trim())}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-muted/50">
                    Previous
                  </span>
                )}
                {currentPage < totalPages ? (
                  <Link
                    href={buildPageHref(currentPage + 1, query.trim())}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-muted/50">
                    Next
                  </span>
                )}
              </div>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
