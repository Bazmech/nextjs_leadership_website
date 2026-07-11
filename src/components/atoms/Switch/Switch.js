"use client";

import * as RadixSwitch from "@radix-ui/react-switch";

export default function Switch({
  id,
  name,
  checked,
  onCheckedChange,
  disabled = false,
  className = "",
}) {
  return (
    <>
      {name ? (
        <input type="hidden" name={name} value={checked ? "true" : "false"} />
      ) : null}
      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full border border-border bg-border transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
      >
        <RadixSwitch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-surface shadow transition-transform data-[state=checked]:translate-x-[1.35rem]" />
      </RadixSwitch.Root>
    </>
  );
}
