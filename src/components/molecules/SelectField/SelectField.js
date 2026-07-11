"use client";

import Label from "@/components/atoms/Label/Label";
import Select from "@/components/atoms/Select/Select";

export default function SelectField({
  id,
  label,
  name,
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        id={id}
        name={name}
        value={value}
        onValueChange={onValueChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
