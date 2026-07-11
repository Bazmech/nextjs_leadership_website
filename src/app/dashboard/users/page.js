import { searchUsers } from "@/actions/users";
import Link from "@/components/atoms/Link/Link";
import UserList from "@/components/organisms/UserList/UserList";
import UserSearchForm from "@/components/organisms/UserSearchForm/UserSearchForm";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata() {
  return buildSimplePageMetadata(
    "Users",
    "Search and manage application users.",
  );
}

export default async function UsersPage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const hasSearched = Object.prototype.hasOwnProperty.call(params, "q");
  const users = hasSearched ? await searchUsers(query) : [];

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
          Users
        </h1>
        <p className="mt-3 text-lg text-muted">
          Search by name or email, then edit a user’s role or access.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <UserSearchForm initialQuery={query} />

          {hasSearched ? (
            <UserList users={users} />
          ) : (
            <p className="mt-6 text-sm text-muted">
              Enter a name or email to find users.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
