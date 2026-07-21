"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  return (
    <form action={formAction} className="mt-8 space-y-6">
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
  );
}
