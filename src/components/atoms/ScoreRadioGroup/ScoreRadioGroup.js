"use client";

import * as RadixRadioGroup from "@radix-ui/react-radio-group";

const SCORE_OPTIONS = [1, 2, 3, 4, 5];

export default function ScoreRadioGroup({
  id,
  name,
  value,
  onValueChange,
  disabled = false,
  className = "",
}) {
  const stringValue = value != null ? String(value) : undefined;

  return (
    <RadixRadioGroup.Root
      id={id}
      name={name}
      value={stringValue}
      onValueChange={(next) => onValueChange?.(Number(next))}
      disabled={disabled}
      className={`flex flex-wrap gap-2 ${className}`.trim()}
      aria-label="Score from 1 to 5"
    >
      {SCORE_OPTIONS.map((score) => (
        <RadixRadioGroup.Item
          key={score}
          value={String(score)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:border-primary/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {score}
        </RadixRadioGroup.Item>
      ))}
    </RadixRadioGroup.Root>
  );
}
