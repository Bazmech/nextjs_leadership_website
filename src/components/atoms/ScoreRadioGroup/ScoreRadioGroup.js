"use client";

import * as RadixRadioGroup from "@radix-ui/react-radio-group";

const SCORE_OPTIONS = [1, 2, 3, 4, 5];

const EMOJI_BY_SCORE = {
  1: "😠",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😄",
};

export default function ScoreRadioGroup({
  id,
  name,
  value,
  onValueChange,
  disabled = false,
  className = "",
}) {
  const stringValue = value != null ? String(value) : "";

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`.trim()}
    >
      <span className="hidden text-xs text-muted sm:inline">
        Strongly Disagree
      </span>
      <RadixRadioGroup.Root
        id={id}
        name={name}
        value={stringValue}
        onValueChange={(next) => onValueChange?.(Number(next))}
        disabled={disabled}
        className="flex flex-wrap gap-2"
        aria-label="Agreement from 1 Strongly Disagree to 5 Strongly Agree"
      >
        {SCORE_OPTIONS.map((score) => (
          <RadixRadioGroup.Item
            key={score}
            value={String(score)}
            onClick={() => {
              if (disabled) return;
              if (stringValue === String(score)) {
                onValueChange?.(null);
              }
            }}
            className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:border-primary/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="group-hover:hidden group-focus-visible:hidden">
              {score}
            </span>
            <span
              className="hidden text-lg group-hover:inline group-focus-visible:inline"
              aria-hidden="true"
            >
              {EMOJI_BY_SCORE[score]}
            </span>
          </RadixRadioGroup.Item>
        ))}
      </RadixRadioGroup.Root>
      <span className="hidden text-xs text-muted sm:inline">
        Strongly Agree
      </span>
    </div>
  );
}
