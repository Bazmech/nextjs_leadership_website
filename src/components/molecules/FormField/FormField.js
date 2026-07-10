import Input from "@/components/atoms/Input/Input";
import Textarea from "@/components/atoms/Textarea/Textarea";

export default function FormField({
  id,
  label,
  as = "input",
  variant = "onDark",
  ...props
}) {
  const Field = as === "textarea" ? Textarea : Input;

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Field id={id} name={id} variant={variant} {...props} />
    </div>
  );
}
