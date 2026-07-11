import * as RadixLabel from "@radix-ui/react-label";

export default function Label({
  htmlFor,
  className = "",
  children,
  ...props
}) {
  return (
    <RadixLabel.Root
      htmlFor={htmlFor}
      className={`text-sm font-medium text-foreground ${className}`.trim()}
      {...props}
    >
      {children}
    </RadixLabel.Root>
  );
}
