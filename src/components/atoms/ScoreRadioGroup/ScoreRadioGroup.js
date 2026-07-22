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
  variant = "numeric",
}) {
  const stringValue = value != null ? String(value) : undefined;
  const isEmoji = variant === "emoji";

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
            className={
              isEmoji
                ? "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-lg transition-colors hover:border-primary/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 data-[state=checked]:ring-2 data-[state=checked]:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                : "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:border-primary/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white disabled:cursor-not-allowed disabled:opacity-60"
            }
          >
            {isEmoji ? (
              <span aria-hidden="true">{EMOJI_BY_SCORE[score]}</span>
            ) : (
              score
            )}
            {isEmoji ? (
              <span className="sr-only">{score}</span>
            ) : null}
          </RadixRadioGroup.Item>
        ))}
      </RadixRadioGroup.Root>
      <span className="hidden text-xs text-muted sm:inline">
        Strongly Agree
      </span>
    </div>
  );
}
