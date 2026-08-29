import Checkbox from "@/components/atoms/Checkbox/Checkbox";
import Label from "@/components/atoms/Label/Label";

export default function CheckboxField({
  id,
  label,
  description,
  name,
  checked,
  onCheckedChange,
  disabled = false,
  compact = false,
}) {
  const descriptionId = description ? `${id}-description` : undefined;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          name={name}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-describedby={descriptionId}
        />
        <Label htmlFor={id} className="cursor-pointer text-xs font-medium">
          {label}
        </Label>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3">
      <Checkbox
        id={id}
        name={name}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={descriptionId}
        className="mt-0.5"
      />
      <div className="min-w-0">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        {description ? (
          <p id={descriptionId} className="mt-1 text-sm text-muted">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
