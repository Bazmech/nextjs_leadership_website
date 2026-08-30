import Link from "@/components/atoms/Link/Link";

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
    </svg>
  );
}

function EnabledIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DisabledIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function formatRole(roleName) {
  return roleName.replace(/_/g, " ");
}

export default function UserList({ users }) {
  if (!users.length) {
    return null;
  }

  return (
    <ul className="mt-6 space-y-3">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted">
              {user.email ?? "No email"}
            </p>
            <p className="mt-1 text-xs capitalize text-muted">
              Account type: {formatRole(user.roleName)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={
                user.enabled
                  ? "inline-flex h-9 w-9 items-center justify-center text-emerald-600 dark:text-emerald-400"
                  : "inline-flex h-9 w-9 items-center justify-center text-red-600 dark:text-red-400"
              }
              title={user.enabled ? "Account enabled" : "Account disabled"}
              aria-label={user.enabled ? "Account enabled" : "Account disabled"}
            >
              {user.enabled ? <EnabledIcon /> : <DisabledIcon />}
            </span>
            {user.canEdit ? (
              <Link
                href={`/dashboard/users/${user.id}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                aria-label={`Edit ${user.name}`}
              >
                <EditIcon />
              </Link>
            ) : (
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted/40"
                title="You cannot edit super admin accounts"
                aria-label="Editing restricted"
              >
                <EditIcon />
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
