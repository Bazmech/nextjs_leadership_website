"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setSubmissionIncludeInAverage } from "@/actions/assessments";
import CheckboxField from "@/components/molecules/CheckboxField/CheckboxField";

const initialState = {
  success: false,
  error: null,
  message: null,
};

export default function IncludeInAverageCheckbox({
  submissionId,
  includeInAverage,
  compact = false,
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(Boolean(includeInAverage));
  const [state, formAction, isPending] = useActionState(
    setSubmissionIncludeInAverage,
    initialState,
  );

  useEffect(() => {
    setChecked(Boolean(includeInAverage));
  }, [includeInAverage]);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
    if (state.error) {
      setChecked(Boolean(includeInAverage));
    }
  }, [state, includeInAverage, router]);

  const checkboxId = `include-in-average-${submissionId}`;

  return (
    <form
      action={formAction}
      onClick={(event) => event.stopPropagation()}
      onSubmit={(event) => event.preventDefault()}
    >
      <CheckboxField
        id={checkboxId}
        label="Include in overall average"
        description={
          compact
            ? undefined
            : "When checked, this completed submission’s domain and attribute averages are stored in the overall assessment average. You can change this at any time after completion."
        }
        checked={checked}
        disabled={isPending}
        compact={compact}
        onCheckedChange={(value) => {
          const next = value === true;
          setChecked(next);
          const formData = new FormData();
          formData.set("submissionId", submissionId);
          formData.set("includeInAverage", next ? "true" : "false");
          formAction(formData);
        }}
      />
      {state.error ? (
        <p
          className={`text-red-600 dark:text-red-300 ${compact ? "mt-1 text-xs" : "mt-2 text-sm"}`}
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
