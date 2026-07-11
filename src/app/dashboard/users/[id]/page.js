import { notFound } from "next/navigation";
import { getUserForEdit } from "@/actions/users";
import Link from "@/components/atoms/Link/Link";
import EditUserForm from "@/components/organisms/EditUserForm/EditUserForm";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const user = await getUserForEdit(id);

  return buildSimplePageMetadata(
    user ? `Edit ${user.name}` : "Edit user",
    "Update a user’s role and account status.",
  );
}

export default async function EditUserPage({ params }) {
  const { id } = await params;
  const user = await getUserForEdit(id);

  if (!user) {
    notFound();
  }

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
          Edit user
        </h1>
        <p className="mt-3 text-lg text-muted">
          Change role and enable or disable this account.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Name</dt>
              <dd className="font-medium text-foreground">{user.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Email</dt>
              <dd className="font-medium text-foreground">
                {user.email ?? "—"}
              </dd>
            </div>
          </dl>

          <EditUserForm user={user} />
        </div>
      </div>
    </div>
  );
}
