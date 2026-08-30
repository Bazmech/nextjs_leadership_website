"use client";

import { useActionState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { deleteAssessmentSubmission } from "@/actions/assessments";
import Button from "@/components/atoms/Button/Button";

const initialState = {
  success: false,
  error: null,
  message: null,
};

export default function DeleteSubmissionButton({
  submissionId,
  className = "",
}) {
  const [state, formAction, isPending] = useActionState(
    deleteAssessmentSubmission,
    initialState,
  );

  return (
    <div className={className}>
      <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
          <Button
            type="button"
            variant="secondary"
            className="!px-5 !py-2 !text-sm !text-red-700 hover:!border-red-500/40 hover:!bg-red-500/10 dark:!text-red-400"
          >
            Delete assessment
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-lg focus:outline-none">
            <AlertDialog.Title className="text-lg font-semibold text-foreground">
              Delete this assessment?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted">
              This removes your in-progress assessment and answers. Completed
              assessments cannot be deleted.
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
              <input type="hidden" name="submissionId" value={submissionId} />
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
                disabled={isPending}
                className="!bg-red-600 hover:!bg-red-700 disabled:opacity-70"
              >
                {isPending ? "Deleting…" : "Delete"}
              </Button>
            </form>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
