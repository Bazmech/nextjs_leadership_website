"use client";

import Label from "@/components/atoms/Label/Label";
import Switch from "@/components/atoms/Switch/Switch";

export default function SwitchField({
  id,
  label,
  description,
  name,
  checked,
  onCheckedChange,
  disabled = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3">
      <div className="min-w-0">
        <Label htmlFor={id}>{label}</Label>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      <Switch
        id={id}
        name={name}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
