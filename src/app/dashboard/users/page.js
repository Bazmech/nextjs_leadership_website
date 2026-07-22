import { searchUsers } from "@/actions/users";
import Link from "@/components/atoms/Link/Link";
import StatCard from "@/components/molecules/StatCard/StatCard";
import UserList from "@/components/organisms/UserList/UserList";
import UserSearchEmptyToast from "@/components/organisms/UserSearchEmptyToast/UserSearchEmptyToast";
import UserSearchForm from "@/components/organisms/UserSearchForm/UserSearchForm";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";
import { getUserAccessCounts } from "@/lib/users";

export async function generateMetadata() {
  return buildSimplePageMetadata(
    "Users",
    "Search and manage application users.",
  );
}

export default async function UsersPage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const hasSearched =
    Object.prototype.hasOwnProperty.call(params, "q") &&
    query.trim().length >= 3;
  const [users, counts] = await Promise.all([
    hasSearched ? searchUsers(query) : Promise.resolve([]),
    getUserAccessCounts(),
  ]);

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

        <dl className="mt-8 grid grid-cols-2 gap-6 rounded-2xl border border-border bg-surface p-6 sm:grid-cols-3">
          <StatCard value={counts.active} label="Active" />
          <StatCard value={counts.disabled} label="Disabled" />
          <StatCard value={counts.waitingRoom} label="Login Waitlist" />
        </dl>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <UserSearchForm initialQuery={query} />

          {hasSearched ? (
            <>
              <UserList users={users} />
              {users.length === 0 ? (
                <UserSearchEmptyToast key={query.trim()} />
              ) : null}
            </>
          ) : (
            <p className="mt-6 text-sm text-muted">
              Enter at least 3 characters to search by name or email.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
