"use client";

import { useActionState, useState } from "react";
import { updateAssessment } from "@/actions/assessments";
import Button from "@/components/atoms/Button/Button";
import Input from "@/components/atoms/Input/Input";
import Label from "@/components/atoms/Label/Label";
import Textarea from "@/components/atoms/Textarea/Textarea";
import SelectField from "@/components/molecules/SelectField/SelectField";

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

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "archived", label: "Archived" },
];

export default function EditAssessmentMetaForm({ assessment }) {
  const [frequency, setFrequency] = useState(assessment.frequency);
  const [status, setStatus] = useState(assessment.status);
  const [state, formAction, isPending] = useActionState(
    updateAssessment,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
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
        options={STATUS_OPTIONS}
        placeholder="Select status"
      />

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
  );
}
