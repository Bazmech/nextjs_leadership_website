"use client";

import { useActionState, useEffect, useState } from "react";
import { renameAssessmentSubmission } from "@/actions/assessments";
import Button from "@/components/atoms/Button/Button";
import Input from "@/components/atoms/Input/Input";
import Label from "@/components/atoms/Label/Label";

const initialState = {
  success: false,
  error: null,
  message: null,
};

export default function RenameSubmissionTitle({ submissionId, title }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [state, formAction, isPending] = useActionState(
    renameAssessmentSubmission,
    initialState,
  );

  useEffect(() => {
    setValue(title);
  }, [title]);

  useEffect(() => {
    if (state.success) {
      setEditing(false);
    }
  }, [state.success]);

  if (!editing) {
    return (
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h1 className="min-w-0 text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="cursor-pointer text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-light"
        >
          Rename
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="submissionId" value={submissionId} />
      <div className="space-y-2">
        <Label htmlFor="submission-title">Assessment name</Label>
        <Input
          id="submission-title"
          name="title"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
          maxLength={200}
          autoFocus
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p
          className="text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          variant="accent-sm"
          disabled={isPending}
          className="disabled:opacity-70"
        >
          {isPending ? "Saving…" : "Save name"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="!px-5 !py-2 !text-sm"
          onClick={() => {
            setValue(title);
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
