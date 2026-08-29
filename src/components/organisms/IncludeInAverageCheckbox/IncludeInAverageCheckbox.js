"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
  const formRef = useRef(null);
  const valueRef = useRef(null);
  const [checked, setChecked] = useState(Boolean(includeInAverage));
  const [state, formAction, isPending] = useActionState(
    setSubmissionIncludeInAverage,
    initialState,
  );

  useEffect(() => {
    setChecked(Boolean(includeInAverage));
    if (valueRef.current) {
      valueRef.current.value = includeInAverage ? "true" : "false";
    }
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
      ref={formRef}
      action={formAction}
      onClick={(event) => event.stopPropagation()}
    >
      <input type="hidden" name="submissionId" value={submissionId} />
      <input
        ref={valueRef}
        type="hidden"
        name="includeInAverage"
        defaultValue={includeInAverage ? "true" : "false"}
      />
      <CheckboxField
        id={checkboxId}
        label="Include in overall average"
        description={
          compact
            ? undefined
            : "When checked, this submission’s scores are included in the overall assessment average for everyone. You can change this at any time, including after completion."
        }
        checked={checked}
        disabled={isPending}
        compact={compact}
        onCheckedChange={(value) => {
          const next = value === true;
          setChecked(next);
          if (valueRef.current) {
            valueRef.current.value = next ? "true" : "false";
          }
          formRef.current?.requestSubmit();
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
