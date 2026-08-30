"use client";

import { useActionState } from "react";
import { startAssessmentSubmission } from "@/actions/assessments";
import Button from "@/components/atoms/Button/Button";
import Input from "@/components/atoms/Input/Input";
import Label from "@/components/atoms/Label/Label";

const initialState = {
  success: false,
  error: null,
  message: null,
};

export default function StartAssessmentForm({
  assessmentId,
  defaultTitle = "",
  disabled = false,
  disabledReason = null,
}) {
  const [state, formAction, isPending] = useActionState(
    startAssessmentSubmission,
    initialState,
  );

  if (disabled) {
    return (
      <p className="text-sm text-muted" role="status">
        {disabledReason ?? "You cannot start this assessment right now."}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <div className="space-y-2">
        <Label htmlFor={`title-${assessmentId}`}>Assessment name</Label>
        <Input
          id={`title-${assessmentId}`}
          name="title"
          defaultValue={defaultTitle}
          required
          maxLength={200}
          placeholder="e.g. Q3 self-assessment"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="accent-sm"
        disabled={isPending}
        className="disabled:opacity-70"
      >
        {isPending ? "Starting…" : "Start assessment"}
      </Button>
    </form>
  );
}
