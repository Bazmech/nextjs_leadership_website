"use client";

import { useActionState, useRef, useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { updateAssessment } from "@/actions/assessments";
import Button from "@/components/atoms/Button/Button";
import Input from "@/components/atoms/Input/Input";
import Label from "@/components/atoms/Label/Label";
import Textarea from "@/components/atoms/Textarea/Textarea";
import SelectField from "@/components/molecules/SelectField/SelectField";
import { isAssessmentStructureLocked } from "@/lib/schemas/assessment";

const initialState = {
  success: false,
  error: null,
  message: null,
};

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
  { value: "yearly", label: "Every year" },
];

const ALL_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "archived", label: "Archived" },
];

const LOCKED_STATUS_OPTIONS = ALL_STATUS_OPTIONS.filter(
  (option) => option.value !== "draft",
);

export default function EditAssessmentMetaForm({ assessment }) {
  const formRef = useRef(null);
  const confirmedPublishRef = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [frequency, setFrequency] = useState(assessment.frequency);
  const [status, setStatus] = useState(assessment.status);
  const [state, formAction, isPending] = useActionState(
    updateAssessment,
    initialState,
  );

  const structureLocked = isAssessmentStructureLocked(assessment.status);
  const statusOptions = structureLocked
    ? LOCKED_STATUS_OPTIONS
    : ALL_STATUS_OPTIONS;
  const isPublishing =
    assessment.status !== "available" && status === "available";

  function handleSubmit(event) {
    if (isPublishing && !confirmedPublishRef.current) {
      event.preventDefault();
      setConfirmOpen(true);
      return;
    }
    confirmedPublishRef.current = false;
  }

  function confirmPublish() {
    confirmedPublishRef.current = true;
    setConfirmOpen(false);
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <input type="hidden" name="assessmentId" value={assessment.id} />

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={assessment.title}
            required
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            maxLength={2000}
            variant="default"
            defaultValue={assessment.description ?? ""}
          />
        </div>

        <SelectField
          id="frequency"
          label="Start frequency"
          name="frequency"
          value={frequency}
          onValueChange={setFrequency}
          options={FREQUENCY_OPTIONS}
          placeholder="Select frequency"
        />

        <SelectField
          id="status"
          label="Status"
          name="status"
          value={status}
          onValueChange={setStatus}
          options={statusOptions}
          placeholder="Select status"
        />

        {structureLocked ? (
          <p className="text-sm text-muted">
            This assessment has been made available. It cannot return to draft,
            and its structure can no longer be edited.
          </p>
        ) : null}

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

        <Button
          type="submit"
          variant="accent-sm"
          disabled={isPending}
          className="disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Saving…" : "Save settings"}
        </Button>
      </form>

      <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-lg focus:outline-none">
            <AlertDialog.Title className="text-lg font-semibold text-foreground">
              Make this assessment available?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted">
              Once available, it cannot be set back to draft. Domains,
              attributes, and statements will be locked and can no longer be
              edited.
            </AlertDialog.Description>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
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
                type="button"
                variant="accent-sm"
                onClick={confirmPublish}
              >
                Make available
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
