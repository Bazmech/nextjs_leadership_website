"use client";

import { useActionState } from "react";
import { submitInquiry } from "@/actions/inquiry";
import Button from "@/components/atoms/Button/Button";
import FormField from "@/components/molecules/FormField/FormField";

const initialState = {
  success: false,
  error: null,
  message: null,
};

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitInquiry,
    initialState,
  );

  return (
    <form action={formAction} className="mx-auto mt-8 max-w-xl space-y-4 text-left">
      <FormField
        id="name"
        label="Name"
        type="text"
        required
        placeholder="Your name"
      />
      <FormField
        id="email"
        label="Email"
        type="email"
        required
        placeholder="you@company.com"
      />
      <FormField
        id="message"
        label="Message"
        as="textarea"
        required
        rows={4}
        placeholder="Tell us about your leadership goals"
      />

      {state.error ? (
        <p className="text-sm text-red-200" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="text-sm text-emerald-200" role="status">
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="accent"
        disabled={isPending}
        className="w-full disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {isPending ? "Sending..." : "Book Your Free Consultation"}
      </Button>
    </form>
  );
}
