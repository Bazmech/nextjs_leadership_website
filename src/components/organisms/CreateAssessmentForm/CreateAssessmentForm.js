"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { createAssessment } from "@/actions/assessments";
import Button from "@/components/atoms/Button/Button";
import Input from "@/components/atoms/Input/Input";
import Label from "@/components/atoms/Label/Label";
import Textarea from "@/components/atoms/Textarea/Textarea";
import SelectField from "@/components/molecules/SelectField/SelectField";

const initialState = {
  success: false,
  error: null,
  message: null,
  assessmentId: null,
};

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
  { value: "yearly", label: "Every year" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "archived", label: "Archived" },
];

export default function CreateAssessmentForm() {
  const router = useRouter();
  const formRef = useRef(null);
  const confirmedPublishRef = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [frequency, setFrequency] = useState("yearly");
  const [status, setStatus] = useState("draft");
  const [state, formAction, isPending] = useActionState(
    createAssessment,
    initialState,
  );

  useEffect(() => {
    if (state.success && state.assessmentId) {
      router.push(`/dashboard/questions/${state.assessmentId}`);
    }
  }, [state.success, state.assessmentId, router]);

  function handleSubmit(event) {
    if (status === "available" && !confirmedPublishRef.current) {
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
        className="mt-8 space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required maxLength={200} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            maxLength={2000}
            variant="default"
          />
        </div>

        <SelectField
          id="frequency"
          label="How often can a user start a new assessment?"
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
          options={STATUS_OPTIONS}
          placeholder="Select status"
        />

        {state.error ? (
          <p className="text-sm text-red-600 dark:text-red-300" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="accent-sm"
          disabled={isPending}
          className="disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Creating…" : "Create assessment"}
        </Button>
      </form>

      <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-lg focus:outline-none">
            <AlertDialog.Title className="text-lg font-semibold text-foreground">
              Create as available?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted">
              Once available, this assessment cannot be set back to draft.
              Domains, attributes, and statements will be locked and can no
              longer be edited. Prefer creating as draft if you still need to
              build the structure.
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
                Create as available
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
