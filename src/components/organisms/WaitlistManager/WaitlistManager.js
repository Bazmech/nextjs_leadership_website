"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { decideWaitlist } from "@/actions/users";
import Button from "@/components/atoms/Button/Button";
import Checkbox from "@/components/atoms/Checkbox/Checkbox";
import LocalDateTime from "@/components/atoms/LocalDateTime/LocalDateTime";

const initialState = {
  success: false,
  error: null,
  message: null,
};

function AcceptIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DenyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function WaitlistConfirmDialog({
  open,
  onOpenChange,
  onSuccess,
  decision,
  entryIds,
  title,
  description,
  confirmLabel,
}) {
  const [state, formAction, isPending] = useActionState(
    decideWaitlist,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
      onOpenChange(false);
    }
  }, [state.success]);

  const isDeny = decision === "deny";

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-lg focus:outline-none">
          <AlertDialog.Title className="text-lg font-semibold text-foreground">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted">
            {description}
          </AlertDialog.Description>

          {state.error ? (
            <p
              className="mt-3 text-sm text-red-600 dark:text-red-300"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}

          <form
            action={formAction}
            className="mt-6 flex flex-wrap justify-end gap-3"
          >
            <input type="hidden" name="decision" value={decision} />
            {entryIds.map((id) => (
              <input key={id} type="hidden" name="entryIds" value={id} />
            ))}
            <AlertDialog.Cancel asChild>
              <Button
                type="button"
                variant="secondary"
                className="!px-5 !py-2 !text-sm"
              >
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending || entryIds.length === 0}
              className={
                isDeny
                  ? "!bg-red-600 hover:!bg-red-700 disabled:opacity-70"
                  : "disabled:opacity-70"
              }
            >
              {isPending ? "Working…" : confirmLabel}
            </Button>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export default function WaitlistManager({ entries }) {
  const router = useRouter();
  const entryIds = useMemo(() => entries.map((entry) => entry.id), [entries]);
  const [selected, setSelected] = useState(() => new Set());
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    setSelected(new Set());
  }, [entryIds.join("|")]);

  const allSelected =
    entryIds.length > 0 && entryIds.every((id) => selected.has(id));
  const selectedCount = selected.size;
  const selectedIds = entryIds.filter((id) => selected.has(id));

  function toggleOne(id, nextChecked) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (nextChecked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function toggleAll(nextChecked) {
    setSelected(nextChecked ? new Set(entryIds) : new Set());
  }

  function openDialog(decision, ids) {
    setDialog({ decision, entryIds: ids });
  }

  if (!entries.length) {
    return (
      <p className="mt-6 text-sm text-muted">
        No pending wait list entries match this view.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Checkbox
            id="waitlist-select-all"
            checked={allSelected}
            onCheckedChange={(value) => toggleAll(value === true)}
            aria-label="Select all wait list entries on this page"
          />
          <label
            htmlFor="waitlist-select-all"
            className="cursor-pointer text-sm text-muted"
          >
            Select all on this page
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="accent-sm"
            disabled={selectedCount === 0}
            className="disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => openDialog("accept", selectedIds)}
          >
            Accept{selectedCount ? ` (${selectedCount})` : ""}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={selectedCount === 0}
            className="!border-red-300 !px-5 !py-2 !text-sm !text-red-700 hover:!bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:!border-red-800 dark:!text-red-300 dark:hover:!bg-red-950/40"
            onClick={() => openDialog("deny", selectedIds)}
          >
            Deny{selectedCount ? ` (${selectedCount})` : ""}
          </Button>
        </div>
      </div>

      <ul className="space-y-3">
        {entries.map((entry) => {
          const isChecked = selected.has(entry.id);
          return (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Checkbox
                  id={`waitlist-${entry.id}`}
                  checked={isChecked}
                  onCheckedChange={(value) =>
                    toggleOne(entry.id, value === true)
                  }
                  aria-label={`Select ${entry.email}`}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {entry.email}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Joined{" "}
                    <LocalDateTime value={entry.createdAt} mode="datetime" />
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openDialog("accept", [entry.id])}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border text-emerald-600 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 dark:text-emerald-400"
                  aria-label={`Accept ${entry.email}`}
                  title="Accept"
                >
                  <AcceptIcon />
                </button>
                <button
                  type="button"
                  onClick={() => openDialog("deny", [entry.id])}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border text-red-600 transition-colors hover:border-red-500/40 hover:bg-red-500/10 dark:text-red-400"
                  aria-label={`Deny ${entry.email}`}
                  title="Deny"
                >
                  <DenyIcon />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {dialog ? (
        <WaitlistConfirmDialog
          key={`${dialog.decision}-${dialog.entryIds.join(",")}`}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          onSuccess={() => {
            setSelected(new Set());
            router.refresh();
          }}
          decision={dialog.decision}
          entryIds={dialog.entryIds}
          title={
            dialog.decision === "accept"
              ? dialog.entryIds.length === 1
                ? "Accept this wait list entry?"
                : `Accept ${dialog.entryIds.length} wait list entries?`
              : dialog.entryIds.length === 1
                ? "Deny this wait list entry?"
                : `Deny ${dialog.entryIds.length} wait list entries?`
          }
          description={
            dialog.decision === "accept"
              ? "Clerk will send an invitation so they can create an account."
              : "They will be removed from the wait list and will not receive an invitation."
          }
          confirmLabel={dialog.decision === "accept" ? "Accept" : "Deny"}
        />
      ) : null}
    </div>
  );
}
